import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, Play, ArrowLeft, AlertCircle, CheckCircle, Lightbulb, Copy } from 'lucide-react';
import axios from 'axios';

const AgentForm = () => {
  const { agentId } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    fetchAgent();
  }, [agentId]);

  const fetchAgent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/agents/${agentId}`);
      setAgent(response.data);
      
      // Initialize form data with empty values
      const initialData = {};
      response.data.input_schema.forEach(field => {
        initialData[field.name] = '';
      });
      setFormData(initialData);
    } catch (err) {
      setError('Failed to fetch agent details');
      console.error('Error fetching agent:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (fieldName, value) => {
    setFormData(prev => ({
      ...prev,
      [fieldName]: value
    }));
    
    // Clear validation error for this field
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => ({
        ...prev,
        [fieldName]: null
      }));
    }
  };

  const handleTestInputClick = (fieldName, testExample) => {
    handleInputChange(fieldName, testExample);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const validateForm = () => {
    const errors = {};
    
    agent.input_schema.forEach(field => {
      if (field.required && (!formData[field.name] || formData[field.name].trim() === '')) {
        errors[field.name] = `${field.name} is required`;
      }
      
      if (field.type === 'dropdown' && field.options && !field.options.includes(formData[field.name])) {
        errors[field.name] = `Please select a valid option`;
      }
    });
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSubmitting(true);
      setError(null);
      
      const response = await axios.post('/api/submit-execution', {
        agent_id: agentId,
        user_id: 'user_001', // Simulated user ID
        inputs: formData
      });
      
      // Navigate to results page
      navigate(`/results/${response.data.execution_id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit execution');
      console.error('Error submitting execution:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const renderField = (field) => {
    const { name, type, required, description, options, placeholder, label, test_example } = field;
    const value = formData[name] || '';
    const error = validationErrors[name];
    const displayLabel = label || name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    switch (type) {
      case 'text':
        return (
          <div className="space-y-2">
            <textarea
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
              placeholder={placeholder || `Enter ${displayLabel.toLowerCase()}`}
              required={required}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
              rows={4}
            />
            {test_example && (
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Try this example:</span>
                <button
                  type="button"
                  onClick={() => handleTestInputClick(name, test_example)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {test_example}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(test_example)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        );
      
      case 'dropdown':
        return (
          <div className="space-y-2">
            <select
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
              required={required}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select an option</option>
              {options?.map((option, index) => (
                <option key={index} value={option}>
                  {option}
                </option>
              ))}
            </select>
            {test_example && (
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Try this example:</span>
                <button
                  type="button"
                  onClick={() => handleTestInputClick(name, test_example)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {test_example}
                </button>
              </div>
            )}
          </div>
        );
      
      case 'password':
        return (
          <div className="space-y-2">
            <input
              type="password"
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
              placeholder={placeholder || `Enter ${displayLabel.toLowerCase()}`}
              required={required}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {test_example && (
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Try this example:</span>
                <button
                  type="button"
                  onClick={() => handleTestInputClick(name, test_example)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {test_example}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(test_example)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        );
      
      case 'email':
        return (
          <div className="space-y-2">
            <input
              type="email"
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
              placeholder={placeholder || `Enter ${displayLabel.toLowerCase()}`}
              required={required}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {test_example && (
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Try this example:</span>
                <button
                  type="button"
                  onClick={() => handleTestInputClick(name, test_example)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {test_example}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(test_example)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        );
      
      case 'url':
        return (
          <div className="space-y-2">
            <input
              type="url"
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
              placeholder={placeholder || `Enter ${displayLabel.toLowerCase()}`}
              required={required}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {test_example && (
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Try this example:</span>
                <button
                  type="button"
                  onClick={() => handleTestInputClick(name, test_example)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {test_example}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(test_example)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        );
      
      case 'number':
        return (
          <div className="space-y-2">
            <input
              type="number"
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
              placeholder={placeholder || `Enter ${displayLabel.toLowerCase()}`}
              required={required}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {test_example && (
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Try this example:</span>
                <button
                  type="button"
                  onClick={() => handleTestInputClick(name, test_example)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {test_example}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(test_example)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        );
      
      case 'file':
        return (
          <div className="space-y-2">
            <input
              type="file"
              onChange={(e) => handleInputChange(name, e.target.files[0])}
              required={required}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {test_example && (
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Example: {test_example}</span>
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div className="space-y-2">
            <input
              type="text"
              value={value}
              onChange={(e) => handleInputChange(name, e.target.value)}
              placeholder={placeholder || `Enter ${displayLabel.toLowerCase()}`}
              required={required}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            {test_example && (
              <div className="flex items-center space-x-2">
                <Lightbulb className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-gray-600">Try this example:</span>
                <button
                  type="button"
                  onClick={() => handleTestInputClick(name, test_example)}
                  className="text-sm text-blue-600 hover:text-blue-700 underline"
                >
                  {test_example}
                </button>
                <button
                  type="button"
                  onClick={() => copyToClipboard(test_example)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Copy className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error && !agent) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Error</h3>
        <p className="text-gray-600 mb-4">{error}</p>
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
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to Agents</span>
        </button>
        
        <div className="flex items-center space-x-3 mb-4">
          <Bot className="h-8 w-8 text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">{agent.title}</h1>
        </div>
        
        <p className="text-gray-600">{agent.description}</p>
        
        {/* Agent Configuration Info */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center space-x-4 text-sm text-blue-700">
            <span><strong>Method:</strong> {agent.http_method || 'POST'}</span>
            <span><strong>Headers:</strong> {Object.keys(agent.headers || {}).length}</span>
            <span><strong>Static Fields:</strong> {Object.keys(agent.static_fields || {}).length}</span>
          </div>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {agent.input_schema.map((field, index) => {
          const displayLabel = field.label || field.name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          return (
            <div key={index} className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                {displayLabel}
                {field.required && <span className="text-red-500 ml-1">*</span>}
              </label>
              
              {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
              
              {renderField(field)}
              
              {validationErrors[field.name] && (
                <p className="text-sm text-red-600 flex items-center space-x-1">
                  <AlertCircle className="h-4 w-4" />
                  <span>{validationErrors[field.name]}</span>
                </p>
              )}
            </div>
          );
        })}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
        >
          {submitting ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Running Agent...</span>
            </>
          ) : (
            <>
              <Play className="h-5 w-5" />
              <span>Run Agent</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default AgentForm; 