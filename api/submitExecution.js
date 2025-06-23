const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const dataManager = require('../lib/data_manager');
const { validateInput } = require('../lib/input_validator');
const { callAgentWebhook } = require('../lib/api_wrapper');

router.post('/submit-execution', async (req, res) => {
    try {
        const { agent_id, user_id, inputs } = req.body;

        if (!agent_id || !user_id || !inputs) {
            return res.status(400).json({ 
                error: 'Missing required fields: agent_id, user_id, inputs' 
            });
        }

        console.log(`[API] Submitting execution for Agent: ${agent_id} by User: ${user_id}`);

        // 1. Get Agent details
        const agent = await dataManager.getAgentById(agent_id);
        console.log(`[API] Found agent: "${agent.title}"`);
        console.log(`[API] Agent execution URL: ${agent.execution_url}`);
        console.log(`[API] Agent HTTP method: ${agent.http_method || 'POST'}`);

        // 2. Validate input against schema
        validateInput(agent.input_schema, inputs);
        console.log('[API] Input validation successful.');

        // 3. Create initial execution record
        const executionId = uuidv4();
        const execution = await dataManager.createExecution({
            execution_id: executionId,
            agent_id: agent_id,
            user_id: user_id,
            status: 'running',
            inputs: inputs,
            createdAt: new Date().toISOString(),
        });
        console.log(`[API] Created execution record with ID: ${executionId}`);

        // 4. Call the agent webhook with enhanced configuration
        const agentResult = await callAgentWebhook(agent, inputs, user_id);
        
        // 5. Handle agent response
        if (agentResult.error) {
            console.log('[API] Agent execution failed:', agentResult.message);
            
            // Update execution record with error
            const failedExecution = await dataManager.updateExecution(executionId, {
                status: 'failed',
                error: agentResult.message,
                result: agentResult,
                completedAt: new Date().toISOString(),
            });

            return res.status(500).json({
                success: false,
                execution_id: executionId,
                error: 'Agent execution failed',
                message: agentResult.message,
                details: agentResult.details
            });
        }
        
        // 6. Update execution record with successful result
        const finalExecution = await dataManager.updateExecution(executionId, {
            status: 'completed',
            result: agentResult,
            completedAt: new Date().toISOString(),
        });

        console.log('[API] Execution completed successfully');
        console.log('[API] Result summary:', agentResult.summary || 'No summary provided');

        res.json({
            success: true,
            execution_id: executionId,
            result: finalExecution.result,
            message: 'Agent execution completed successfully'
        });

    } catch (error) {
        console.error('[API] Execution failed:', error.message);
        
        // If we have an execution_id from the current request, update it to failed status
        if (typeof executionId !== 'undefined') {
            try {
                await dataManager.updateExecution(executionId, {
                    status: 'failed',
                    error: error.message,
                    completedAt: new Date().toISOString(),
                });
            } catch (updateError) {
                console.error('[API] Failed to update execution status:', updateError);
            }
        }

        res.status(500).json({ 
            error: 'Execution failed', 
            message: error.message 
        });
    }
});

module.exports = router; 