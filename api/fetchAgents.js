const express = require('express');
const router = express.Router();
const dataManager = require('../lib/data_manager');

// Get all agents
router.get('/agents', async (req, res) => {
    try {
        const fs = require('fs').promises;
        const path = require('path');
        const agentsPath = path.join(__dirname, '..', 'agents.json');
        const agentsData = await fs.readFile(agentsPath, 'utf-8');
        const agents = JSON.parse(agentsData);
        
        console.log(`[API] Fetching all agents. Found ${agents.length} agents.`);
        
        res.json(agents);
    } catch (error) {
        console.error('[API] Error fetching agents:', error);
        res.status(500).json({ error: 'Failed to fetch agents' });
    }
});

// Get agent by ID
router.get('/agents/:agentId', async (req, res) => {
    try {
        const { agentId } = req.params;
        
        if (!agentId) {
            return res.status(400).json({ 
                error: 'Missing required parameter: agentId' 
            });
        }

        console.log(`[API] Fetching agent with ID: ${agentId}`);

        const agent = await dataManager.getAgentById(agentId);
        
        if (!agent) {
            return res.status(404).json({ 
                error: 'Agent not found',
                message: `No agent found with ID: ${agentId}`
            });
        }

        console.log(`[API] Found agent: "${agent.title}"`);

        res.json(agent);
    } catch (error) {
        console.error('[API] Error fetching agent:', error);
        res.status(500).json({ 
            error: 'Failed to fetch agent', 
            message: error.message 
        });
    }
});

module.exports = router; 