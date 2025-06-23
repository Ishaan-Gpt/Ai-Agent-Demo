# AI Agent Marketplace

A comprehensive marketplace for AI agents with real integrations to various AI services and platforms.

## Features

- **Real AI Agent Integrations**: Connect to actual AI services like Superagent, Suna AI, LangChain, and more
- **Comprehensive Input Schemas**: Each agent has detailed input requirements with validation
- **API Key Management**: Secure handling of API keys for different services
- **Markdown Support**: Rich text rendering for agent responses
- **Continuous Chat Interface**: Real-time conversation with agents
- **Test Examples**: Pre-filled examples to help users understand input requirements

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- API keys for the AI services you want to use

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd AI_AGENTS
```

2. Install dependencies:
```bash
npm install
cd client && npm install
```

3. Start the backend server:
```bash
npm start
```

4. In a new terminal, start the frontend:
```bash
cd client && npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Available Agents

### 1. Social Media Automation Agent
- **Service**: Social Media Automation API
- **Capabilities**: Creates posts, videos, SEO reports, replies to comments
- **Required**: API key, platform selection, content type, topics
- **API Key**: Get from your social media automation service

### 2. Grammar Corrector Agent
- **Service**: Grammar Correction API
- **Capabilities**: Corrects grammar and improves writing style
- **Required**: API key, text to correct
- **API Key**: Get from grammar correction service

### 3. Superagent RAG Assistant
- **Service**: Superagent RAG API
- **Capabilities**: Document-based question answering with vector search
- **Required**: Superagent API key, query, knowledge base setup
- **API Key**: Get from [Superagent](https://superagent.sh)

### 4. Suna Generalist Agent
- **Service**: Suna AI API
- **Capabilities**: Writing, analysis, coding, creative tasks
- **Required**: Suna API key, task description
- **API Key**: Get from [Suna AI](https://suna.ai)

### 5. Steel Browser Automation Agent
- **Service**: Steel Browser API
- **Capabilities**: Web scraping, browser automation, testing
- **Required**: Steel Browser API key, target URL, action type
- **API Key**: Get from [Steel Browser](https://steel-browser.com)

### 6. BotSharp NLP Agent
- **Service**: BotSharp NLP API
- **Capabilities**: Text analysis, sentiment analysis, entity extraction
- **Required**: BotSharp API key, text to analyze, analysis type
- **API Key**: Get from [BotSharp](https://botsharp.ai)

### 7. RESTai API Agent
- **Service**: RESTai API
- **Capabilities**: HTTP requests, API integration, data processing
- **Required**: RESTai API key, target API URL, HTTP method
- **API Key**: Get from [RESTai](https://restai.com)

### 8. AutoGen Workflow Agent
- **Service**: AutoGen Workflow API
- **Capabilities**: Multi-agent workflow orchestration
- **Required**: AutoGen API key, task description, agent roles
- **API Key**: Get from [AutoGen](https://autogen.ai)

### 9. CrewAI Team Agent
- **Service**: CrewAI API
- **Capabilities**: Team-based AI collaboration
- **Required**: CrewAI API key, project goal, team composition
- **API Key**: Get from [CrewAI](https://crewai.com)

### 10. LangChain Toolkit Agent
- **Service**: LangChain API
- **Capabilities**: Tool integration, data processing, external services
- **Required**: LangChain API key, user query, tools needed
- **API Key**: Get from [LangChain](https://langchain.com)

### 11. Nekro Creative Agent
- **Service**: Nekro Creative API
- **Capabilities**: Content generation, storytelling, artistic expression
- **Required**: Nekro API key, creative prompt, content type
- **API Key**: Get from [Nekro AI](https://nekro.ai)

### 12. Gaia Analytics Agent
- **Service**: Gaia Analytics API
- **Capabilities**: Data analytics, business intelligence, insights
- **Required**: Gaia Analytics API key, data query, analysis type
- **API Key**: Get from [Gaia Analytics](https://gaia-analytics.com)

## API Key Setup

### Getting API Keys

1. **Superagent**: Visit [superagent.sh](https://superagent.sh) and sign up for an account
2. **Suna AI**: Visit [suna.ai](https://suna.ai) and create an account
3. **Steel Browser**: Visit [steel-browser.com](https://steel-browser.com) for browser automation
4. **BotSharp**: Visit [botsharp.ai](https://botsharp.ai) for NLP services
5. **RESTai**: Visit [restai.com](https://restai.com) for API integration
6. **AutoGen**: Visit [autogen.ai](https://autogen.ai) for workflow orchestration
7. **CrewAI**: Visit [crewai.com](https://crewai.com) for team collaboration
8. **LangChain**: Visit [langchain.com](https://langchain.com) for toolkit services
9. **Nekro AI**: Visit [nekro.ai](https://nekro.ai) for creative content
10. **Gaia Analytics**: Visit [gaia-analytics.com](https://gaia-analytics.com) for analytics

### Using API Keys

1. **Secure Storage**: API keys are processed securely and not stored permanently
2. **Input Field**: Enter your API key in the designated field for each agent
3. **Validation**: The system validates API keys before making requests
4. **Error Handling**: Clear error messages for invalid or expired keys

## Agent Usage

### Basic Usage

1. **Browse Agents**: View available agents in the marketplace
2. **Select Agent**: Click on an agent to see its details and input requirements
3. **Fill Inputs**: Use the test examples or enter your own values
4. **Add API Key**: Enter your API key for the service
5. **Execute**: Click "Execute Agent" to run the agent
6. **View Results**: See the agent's response with markdown formatting

### Advanced Usage

1. **Chat Interface**: Use the continuous chat for ongoing conversations
2. **Input Validation**: System validates all inputs before execution
3. **Error Handling**: Comprehensive error messages for troubleshooting
4. **Response Formatting**: Rich markdown rendering for better readability

## Input Schema Types

### Supported Field Types

- **text**: General text input
- **password**: Secure input for API keys
- **dropdown**: Selection from predefined options
- **number**: Numeric input
- **url**: URL input with validation
- **email**: Email input with validation
- **file**: File upload (for data analysis agents)

### Field Properties

- **required**: Whether the field is mandatory
- **label**: Human-readable label
- **description**: Helpful description
- **placeholder**: Example placeholder text
- **test_example**: Pre-filled example value
- **options**: Available options for dropdown fields
- **min_length/max_length**: Length constraints

## Error Handling

### Common Error Types

1. **Authentication Errors (401/403)**: Invalid or expired API key
2. **Rate Limiting (429)**: Too many requests, try again later
3. **Service Unavailable**: AI service is down or overloaded
4. **Network Errors**: Connection issues or invalid URLs
5. **Input Validation**: Missing required fields or invalid data

### Troubleshooting

1. **Check API Key**: Ensure your API key is correct and active
2. **Verify Service Status**: Check if the AI service is operational
3. **Review Inputs**: Make sure all required fields are filled correctly
4. **Check Network**: Ensure stable internet connection
5. **Contact Support**: For persistent issues, contact the service provider

## Development

### Project Structure

```
AI_AGENTS/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   └── utils/         # Frontend utilities
├── api/                   # API endpoints
├── lib/                   # Backend libraries
├── utils/                 # Backend utilities
├── agents.json           # Agent configurations
└── server.js             # Main server file
```

### Adding New Agents

1. **Define Agent**: Add agent configuration to `agents.json`
2. **Input Schema**: Define required inputs with validation
3. **API Integration**: Update `lib/api_wrapper.js` for response handling
4. **Test**: Verify agent works with real API calls

### Customization

- **Agent Configurations**: Modify `agents.json` for agent settings
- **Response Handling**: Update API wrapper for custom response formats
- **UI Components**: Customize React components in `client/src/components/`
- **Styling**: Modify CSS in `client/src/` for visual changes

## Security

### API Key Security

- Keys are processed in memory only
- No permanent storage of sensitive data
- Secure transmission to AI services
- Input validation and sanitization

### Best Practices

- Use environment variables for sensitive data
- Regularly rotate API keys
- Monitor API usage and costs
- Implement rate limiting if needed

## Support

### Getting Help

1. **Documentation**: Check this README for usage instructions
2. **Error Messages**: Read detailed error messages for troubleshooting
3. **Service Status**: Check individual AI service status pages
4. **Community**: Join discussions in the project repository

### Contributing

1. **Fork Repository**: Create your own fork
2. **Create Branch**: Make changes in a feature branch
3. **Test Changes**: Ensure all agents work correctly
4. **Submit PR**: Create pull request with detailed description

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- All AI service providers for their APIs
- Open source community for tools and libraries
- Contributors and users of the marketplace 