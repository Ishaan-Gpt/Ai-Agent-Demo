const express = require('express');
const cors = require('cors');
const path = require('path');

// Import API routes
const submitExecution = require('./api/submitExecution');
const fetchExecutions = require('./api/fetchExecutions');
const createAgent = require('./api/createAgent');
const fetchAgents = require('./api/fetchAgents');

const app = express();
const PORT = process.env.PORT || 7001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api', submitExecution);
app.use('/api', fetchExecutions);
app.use('/api', createAgent);
app.use('/api', fetchAgents);

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'AI Agent Marketplace API is running',
        timestamp: new Date().toISOString()
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({ 
        message: 'AI Agent Marketplace API',
        version: '1.0.0',
        endpoints: {
            health: '/api/health',
            agents: '/api/agents',
            executions: '/api/executions',
            submit: '/api/submit-execution'
        }
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        error: 'Internal server error', 
        message: err.message 
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Not found', 
        message: 'The requested endpoint does not exist' 
    });
});

app.listen(PORT, () => {
    console.log(`🚀 AI Agent Marketplace Server running on port ${PORT}`);
    console.log(`📱 Frontend: http://localhost:3000`);
    console.log(`🔧 API: http://localhost:${PORT}/api`);
}); 