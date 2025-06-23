const express = require('express');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

router.post('/create-agent', async (req, res) => {
    try {
        const { 
            creator_id, 
            title, 
            description, 
            execution_url, 
            http_method = 'POST',
            headers = {},
            static_fields = {},
            input_schema 
        } = req.body;

        // Validate required fields
        if (!creator_id || !title || !description || !execution_url || !input_schema) {
            return res.status(400).json({ 
                error: 'Missing required fields: creator_id, title, description, execution_url, input_schema' 
            });
        }

        // Validate HTTP method
        const validMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
        if (!validMethods.includes(http_method.toUpperCase())) {
            return res.status(400).json({ 
                error: 'Invalid HTTP method. Must be one of: GET, POST, PUT, PATCH, DELETE' 
            });
        }

        // Validate input_schema structure
        if (!Array.isArray(input_schema)) {
            return res.status(400).json({ 
                error: 'input_schema must be an array' 
            });
        }

        // Validate each field in input_schema
        for (const field of input_schema) {
            if (!field.name || !field.type) {
                return res.status(400).json({ 
                    error: 'Each field in input_schema must have name and type' 
                });
            }
            
            // Validate field types
            const validTypes = ['string', 'text', 'dropdown', 'email', 'url', 'number', 'password', 'file'];
            if (!validTypes.includes(field.type)) {
                return res.status(400).json({ 
                    error: `Invalid field type: ${field.type}. Must be one of: ${validTypes.join(', ')}` 
                });
            }
            
            // Validate dropdown options
            if (field.type === 'dropdown' && (!field.options || !Array.isArray(field.options) || field.options.length === 0)) {
                return res.status(400).json({ 
                    error: 'Dropdown fields must have at least one option' 
                });
            }
        }

        // Validate headers (must be object)
        if (headers && typeof headers !== 'object') {
            return res.status(400).json({ 
                error: 'Headers must be an object' 
            });
        }

        // Validate static_fields (must be object)
        if (static_fields && typeof static_fields !== 'object') {
            return res.status(400).json({ 
                error: 'Static fields must be an object' 
            });
        }

        console.log(`[API] Creating new agent: "${title}" by Creator: ${creator_id}`);

        // Generate unique agent ID
        const agentId = `agent_${uuidv4().split('-')[0]}`;

        // Create agent object with all new fields
        const newAgent = {
            agent_id: agentId,
            creator_id: creator_id,
            title: title,
            description: description,
            execution_url: execution_url,
            http_method: http_method.toUpperCase(),
            headers: headers,
            static_fields: static_fields,
            input_schema: input_schema,
            created_at: new Date().toISOString(),
            status: 'active'
        };

        // Read existing agents
        const agentsPath = path.join(__dirname, '..', 'agents.json');
        const agentsData = await fs.readFile(agentsPath, 'utf-8');
        const agents = JSON.parse(agentsData);

        // Add new agent
        agents.push(newAgent);

        // Write back to file
        await fs.writeFile(agentsPath, JSON.stringify(agents, null, 2), 'utf-8');

        console.log(`[API] Agent created successfully with ID: ${agentId}`);
        console.log(`[API] Agent configuration:`, {
            method: newAgent.http_method,
            headers: Object.keys(newAgent.headers).length,
            static_fields: Object.keys(newAgent.static_fields).length,
            input_fields: newAgent.input_schema.length
        });

        res.json({
            success: true,
            agent: newAgent,
            message: 'Agent created successfully'
        });

    } catch (error) {
        console.error('[API] Error creating agent:', error);
        res.status(500).json({ 
            error: 'Failed to create agent', 
            message: error.message 
        });
    }
});

// Get agents by creator
router.get('/creator/:creatorId/agents', async (req, res) => {
    try {
        const { creatorId } = req.params;
        
        if (!creatorId) {
            return res.status(400).json({ 
                error: 'Missing required parameter: creatorId' 
            });
        }

        console.log(`[API] Fetching agents for Creator: ${creatorId}`);

        // Read agents from file
        const agentsPath = path.join(__dirname, '..', 'agents.json');
        const agentsData = await fs.readFile(agentsPath, 'utf-8');
        const allAgents = JSON.parse(agentsData);

        // Filter agents for this creator
        const creatorAgents = allAgents.filter(agent => agent.creator_id === creatorId);

        // Sort by creation date (newest first)
        creatorAgents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

        console.log(`[API] Found ${creatorAgents.length} agents for creator ${creatorId}`);

        res.json({
            success: true,
            agents: creatorAgents,
            count: creatorAgents.length
        });

    } catch (error) {
        console.error('[API] Error fetching creator agents:', error);
        res.status(500).json({ 
            error: 'Failed to fetch creator agents', 
            message: error.message 
        });
    }
});

module.exports = router; 