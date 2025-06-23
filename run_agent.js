const { v4: uuidv4 } = require('uuid');
const dataManager = require('./lib/data_manager');
const { validateInput } = require('./lib/input_validator');
const { callAgentWebhook } = require('./lib/api_wrapper');

function parseArgs() {
    const args = {};
    process.argv.slice(2).forEach(arg => {
        const [key, value] = arg.split('=');
        if (key.startsWith('--')) {
            args[key.substring(2)] = value;
        }
    });
    if (!args.agent || !args.user) {
        throw new Error('Usage: node run_agent.js --agent=<agent_id> --user=<user_id>');
    }
    return args;
}

async function run() {
    try {
        const { agent: agentId, user: userId } = parseArgs();
        console.log(`[Router] Initiating run for Agent: ${agentId} by User: ${userId}`);

        // 1. Get Agent details
        const agent = await dataManager.getAgentById(agentId);
        console.log(`[Router] Found agent: "${agent.title}"`);
        console.log(`[Router] Agent execution URL: ${agent.execution_url}`);
        console.log(`[Router] Agent HTTP method: ${agent.http_method || 'POST'}`);

        // 2. Simulate user providing valid input for this agent
        const userInput = {};
        agent.input_schema.forEach(field => {
            if (field.required) {
                switch (field.type) {
                    case 'string':
                    case 'text':
                        userInput[field.name] = `Sample ${field.label || field.name}`;
                        break;
                    case 'dropdown':
                        userInput[field.name] = field.options ? field.options[0] : 'option1';
                        break;
                    case 'email':
                        userInput[field.name] = 'user@example.com';
                        break;
                    case 'url':
                        userInput[field.name] = 'https://example.com';
                        break;
                    case 'number':
                        userInput[field.name] = 42;
                        break;
                    default:
                        userInput[field.name] = `Sample ${field.label || field.name}`;
                }
            }
        });
        
        console.log('[Router] User input provided:', userInput);

        // 3. Validate input against schema
        validateInput(agent.input_schema, userInput);
        console.log('[Router] Input validation successful.');

        // 4. Create initial execution record
        const executionId = uuidv4();
        const execution = await dataManager.createExecution({
            execution_id: executionId,
            agent_id: agentId,
            user_id: userId,
            status: 'running',
            inputs: userInput,
            createdAt: new Date().toISOString(),
        });
        console.log(`[Router] Created execution record with ID: ${executionId}`);

        // 5. Call the agent webhook with enhanced configuration
        const agentResult = await callAgentWebhook(agent, userInput, userId);
        
        // 6. Handle agent response
        if (agentResult.error) {
            console.log('[Router] Agent execution failed:', agentResult.message);
            
            // Update execution record with error
            const failedExecution = await dataManager.updateExecution(executionId, {
                status: 'failed',
                error: agentResult.message,
                result: agentResult,
                completedAt: new Date().toISOString(),
            });

            console.log('\n❌ ❌ ❌ --- EXECUTION FAILED --- ❌ ❌ ❌');
            console.error('Error:', agentResult.message);
            console.error('Details:', agentResult.details);
            return;
        }
        
        // 7. Update execution record with successful result
        const finalExecution = await dataManager.updateExecution(executionId, {
            status: 'completed',
            result: agentResult,
            completedAt: new Date().toISOString(),
        });

        console.log('\n✅ ✅ ✅ --- EXECUTION COMPLETE --- ✅ ✅ ✅');
        console.log('Final Result:');
        console.log(JSON.stringify(finalExecution.result, null, 2));
        console.log(`\n[Router] Execution details saved to executions.json.`);

    } catch (error) {
        console.error('\n❌ ❌ ❌ --- EXECUTION FAILED --- ❌ ❌ ❌');
        console.error(error.message);
        // Optionally, update the execution record to a 'failed' state here
    }
}

run(); 