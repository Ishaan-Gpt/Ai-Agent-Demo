const express = require('express');
const router = express.Router();
const dataManager = require('../lib/data_manager');

router.get('/executions/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        
        if (!userId) {
            return res.status(400).json({ 
                error: 'Missing required parameter: userId' 
            });
        }

        console.log(`[API] Fetching executions for User: ${userId}`);

        // Read executions from file
        const fs = require('fs').promises;
        const executionsPath = require('path').join(__dirname, '..', 'executions.json');
        const executions = await fs.readFile(executionsPath, 'utf-8');
        const allExecutions = JSON.parse(executions);

        // Filter executions for this user
        const userExecutions = allExecutions.filter(exec => exec.user_id === userId);

        // Sort by creation date (newest first)
        userExecutions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        console.log(`[API] Found ${userExecutions.length} executions for user ${userId}`);

        res.json({
            success: true,
            executions: userExecutions,
            count: userExecutions.length
        });

    } catch (error) {
        console.error('[API] Error fetching executions:', error);
        res.status(500).json({ 
            error: 'Failed to fetch executions', 
            message: error.message 
        });
    }
});

router.get('/executions/:userId/:executionId', async (req, res) => {
    try {
        const { userId, executionId } = req.params;
        
        if (!userId || !executionId) {
            return res.status(400).json({ 
                error: 'Missing required parameters: userId, executionId' 
            });
        }

        console.log(`[API] Fetching execution ${executionId} for User: ${userId}`);

        // Read executions from file
        const fs = require('fs').promises;
        const executionsPath = require('path').join(__dirname, '..', 'executions.json');
        const executions = await fs.readFile(executionsPath, 'utf-8');
        const allExecutions = JSON.parse(executions);

        // Find specific execution for this user
        const execution = allExecutions.find(exec => 
            exec.execution_id === executionId && exec.user_id === userId
        );

        if (!execution) {
            return res.status(404).json({ 
                error: 'Execution not found' 
            });
        }

        console.log(`[API] Found execution ${executionId}`);

        res.json({
            success: true,
            execution: execution
        });

    } catch (error) {
        console.error('[API] Error fetching execution:', error);
        res.status(500).json({ 
            error: 'Failed to fetch execution', 
            message: error.message 
        });
    }
});

module.exports = router; 