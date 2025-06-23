const fs = require('fs').promises;
const path = require('path');

const AGENTS_PATH = path.join(__dirname, '..', 'agents.json');
const EXECUTIONS_PATH = path.join(__dirname, '..', 'executions.json');

async function readData(filePath) {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch (error) {
        console.error(`Error reading from ${filePath}:`, error);
        throw error;
    }
}

async function writeData(filePath, data) {
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
    } catch (error)
    {
        console.error(`Error writing to ${filePath}:`, error);
        throw error;
    }
}

async function getAgentById(agentId) {
    const agents = await readData(AGENTS_PATH);
    const agent = agents.find(a => a.agent_id === agentId);
    if (!agent) {
        throw new Error(`Agent with ID "${agentId}" not found.`);
    }
    return agent;
}

async function createExecution(executionData) {
    const executions = await readData(EXECUTIONS_PATH);
    executions.push(executionData);
    await writeData(EXECUTIONS_PATH, executions);
    return executionData;
}

async function updateExecution(executionId, updates) {
    const executions = await readData(EXECUTIONS_PATH);
    const executionIndex = executions.findIndex(e => e.execution_id === executionId);
    if (executionIndex === -1) {
        throw new Error(`Execution with ID "${executionId}" not found.`);
    }
    executions[executionIndex] = { ...executions[executionIndex], ...updates };
    await writeData(EXECUTIONS_PATH, executions);
    return executions[executionIndex];
}

module.exports = {
    getAgentById,
    createExecution,
    updateExecution,
}; 