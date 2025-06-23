import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, Bot, User, Loader2, Lightbulb, Copy } from 'lucide-react';
import axios from 'axios';

// Simple markdown renderer
const renderMarkdown = (text) => {
  if (!text) return '';
  
  return text
    // Headers: ### Header
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-2 mb-1">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-3 mb-2">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-4 mb-3">$1</h1>')
    // Bold text: **text** or __text__
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/__(.*?)__/g, '<strong>$1</strong>')
    // Italic text: *text* or _text_
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/_(.*?)_/g, '<em>$1</em>')
    // Code blocks: ```code```
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-2 rounded text-sm overflow-x-auto my-2"><code>$1</code></pre>')
    // Inline code: `code`
    .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Lists: - item or * item
    .replace(/^[\s]*[-*] (.*$)/gim, '<li class="ml-4">$1</li>')
    // Wrap lists in ul tags
    .replace(/(<li.*<\/li>)/g, '<ul class="list-disc ml-4 my-2">$1</ul>')
    // Line breaks
    .replace(/\n/g, '<br />');
};

const ChatInterface = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showExamples, setShowExamples] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchAgent();
  }, [agentId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchAgent = async () => {
    try {
      const response = await axios.get(`/api/agents/${agentId}`);
      setAgent(response.data);
      
      // Add welcome message
      setMessages([
        {
          id: 'welcome',
          type: 'agent',
          content: `Hello! I'm ${response.data.title}. ${response.data.description}`,
          timestamp: new Date().toISOString()
        }
      ]);
    } catch (err) {
      setError('Failed to load agent');
      console.error('Error fetching agent:', err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post('/api/submit-execution', {
        agent_id: agentId,
        user_id: 'user_001',
        inputs: { message: inputMessage }
      });

      const agentResponse = {
        id: response.data.execution_id,
        type: 'agent',
        content: response.data.result?.response || 'I processed your request successfully.',
        timestamp: new Date().toISOString(),
        executionId: response.data.execution_id
      };

      setMessages(prev => [...prev, agentResponse]);
    } catch (err) {
      const errorMessage = {
        id: Date.now(),
        type: 'error',
        content: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
      console.error('Error sending message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    setInputMessage(example);
    setShowExamples(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Get test examples from agent schema
  const getTestExamples = () => {
    if (!agent?.input_schema) return [];
    
    return agent.input_schema
      .filter(field => field.test_example)
      .map(field => ({
        label: field.label || field.name,
        example: field.test_example
      }));
  };

  const testExamples = getTestExamples();

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold mb-4">{error}</div>
        <button 
          onClick={() => navigate('/')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to Agents
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/')}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <Bot className="h-6 w-6 text-blue-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {agent?.title || 'Loading...'}
              </h1>
              <p className="text-sm text-gray-500">
                {agent?.description || 'AI Agent'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.type === 'user'
                  ? 'bg-blue-600 text-white'
                  : message.type === 'error'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-white border text-gray-800'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.type === 'agent' && (
                  <Bot className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                )}
                {message.type === 'user' && (
                  <User className="h-4 w-4 text-white mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div 
                    className="text-sm"
                    dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
                  />
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border rounded-lg px-4 py-2">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                <span className="text-sm text-gray-600">Agent is thinking...</span>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t px-6 py-4">
        {/* Test Examples */}
        {testExamples.length > 0 && (
          <div className="mb-4">
            <button
              type="button"
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-700"
            >
              <Lightbulb className="h-4 w-4" />
              <span>{showExamples ? 'Hide' : 'Show'} example inputs</span>
            </button>
            
            {showExamples && (
              <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-2">Try these examples:</p>
                <div className="space-y-2">
                  {testExamples.map((example, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1">
                        <span className="text-xs text-gray-500">{example.label}:</span>
                        <button
                          type="button"
                          onClick={() => handleExampleClick(example.example)}
                          className="block text-sm text-blue-600 hover:text-blue-700 underline text-left"
                        >
                          {example.example}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(example.example)}
                        className="text-gray-400 hover:text-gray-600 ml-2"
                      >
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex space-x-4">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface; 