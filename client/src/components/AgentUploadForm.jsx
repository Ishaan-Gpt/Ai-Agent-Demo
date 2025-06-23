import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bot, Upload, Plus, Trash2, AlertCircle, CheckCircle, Settings, Key } from 'lucide-react';
import axios from 'axios';

const AgentUploadForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    creator_id: 'creator_123',
    title: '',
    description: '',
    execution_url: '',
    http_method: 'POST',
    headers: {},
    static_fields: {},
    input_schema: []
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState('basic');

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addSchemaField = () => {
    setFormData(prev => ({
      ...prev,
      input_schema: [
        ...prev.input_schema,
        {
          name: '',
          type: 'string',
          label: '',
          required: false,
          description: '',
          placeholder: ''
        }
      ]
    }));
  };

  const removeSchemaField = (index) => {
    setFormData(prev => ({
      ...prev,
      input_schema: prev.input_schema.filter((_, i) => i !== index)
    }));
  };

  const updateSchemaField = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      input_schema: prev.input_schema.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const addDropdownOption = (index) => {
    setFormData(prev => ({
      ...prev,
      input_schema: prev.input_schema.map((item, i) => 
        i === index ? { 
          ...item, 
          options: [...(item.options || []), ''] 
        } : item
      )
    }));
  };

  const removeDropdownOption = (fieldIndex, optionIndex) => {
    setFormData(prev => ({
      ...prev,
      input_schema: prev.input_schema.map((item, i) => 
        i === fieldIndex ? { 
          ...item, 
          options: item.options.filter((_, j) => j !== optionIndex)
        } : item
      )
    }));
  };

  const updateDropdownOption = (fieldIndex, optionIndex, value) => {
    setFormData(prev => ({
      ...prev,
      input_schema: prev.input_schema.map((item, i) => 
        i === fieldIndex ? { 
          ...item, 
          options: item.options.map((opt, j) => j === optionIndex ? value : opt)
        } : item
      )
    }));
  };

  // Header management
  const addHeader = () => {
    setFormData(prev => ({
      ...prev,
      headers: {
        ...prev.headers,
        '': ''
      }
    }));
  };

  const updateHeader = (oldKey, newKey, value) => {
    setFormData(prev => {
      const newHeaders = { ...prev.headers };
      if (oldKey !== newKey) {
        delete newHeaders[oldKey];
      }
      newHeaders[newKey] = value;
      return { ...prev, headers: newHeaders };
    });
  };

  const removeHeader = (key) => {
    setFormData(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  // Static fields management
  const addStaticField = () => {
    setFormData(prev => ({
      ...prev,
      static_fields: {
        ...prev.static_fields,
        '': ''
      }
    }));
  };

  const updateStaticField = (oldKey, newKey, value) => {
    setFormData(prev => {
      const newStaticFields = { ...prev.static_fields };
      if (oldKey !== newKey) {
        delete newStaticFields[oldKey];
      }
      newStaticFields[newKey] = value;
      return { ...prev, static_fields: newStaticFields };
    });
  };

  const removeStaticField = (key) => {
    setFormData(prev => {
      const newStaticFields = { ...prev.static_fields };
      delete newStaticFields[key];
      return { ...prev, static_fields: newStaticFields };
    });
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return false;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    if (!formData.execution_url.trim()) {
      setError('Execution URL is required');
      return false;
    }
    if (!formData.execution_url.startsWith('http')) {
      setError('Execution URL must be a valid HTTP/HTTPS URL');
      return false;
    }
    if (formData.input_schema.length === 0) {
      setError('At least one input field is required');
      return false;
    }
    
    for (const field of formData.input_schema) {
      if (!field.name.trim()) {
        setError('All input fields must have a name');
        return false;
      }
      if (!field.label.trim()) {
        setError('All input fields must have a label');
        return false;
      }
      if (field.type === 'dropdown' && (!field.options || field.options.length === 0)) {
        setError('Dropdown fields must have at least one option');
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await axios.post('/api/create-agent', formData);
      
      setSuccess(true);
      setTimeout(() => {
        navigate('/creator');
      }, 2000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create agent');
      console.error('Error creating agent:', err);
    } finally {
      setLoading(false);
    }
  };

  const renderSchemaField = (field, index) => (
    <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="font-medium text-gray-900">Input Field {index + 1}</h4>
        <button
          type="button"
          onClick={() => removeSchemaField(index)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Name *
          </label>
          <input
            type="text"
            value={field.name}
            onChange={(e) => updateSchemaField(index, 'name', e.target.value)}
            placeholder="e.g., user_input, api_key"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Display Label *
          </label>
          <input
            type="text"
            value={field.label}
            onChange={(e) => updateSchemaField(index, 'label', e.target.value)}
            placeholder="e.g., User Input, API Key"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Field Type *
          </label>
          <select
            value={field.type}
            onChange={(e) => updateSchemaField(index, 'type', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="string">Text Input</option>
            <option value="text">Text Area</option>
            <option value="dropdown">Dropdown</option>
            <option value="email">Email</option>
            <option value="url">URL</option>
            <option value="number">Number</option>
            <option value="password">Password</option>
            <option value="file">File Upload</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Placeholder
          </label>
          <input
            type="text"
            value={field.placeholder}
            onChange={(e) => updateSchemaField(index, 'placeholder', e.target.value)}
            placeholder="Placeholder text for the input"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          value={field.description}
          onChange={(e) => updateSchemaField(index, 'description', e.target.value)}
          placeholder="What this field is for"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id={`required-${index}`}
          checked={field.required}
          onChange={(e) => updateSchemaField(index, 'required', e.target.checked)}
          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor={`required-${index}`} className="text-sm text-gray-700">
          Required field
        </label>
      </div>
      
      {field.type === 'dropdown' && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Dropdown Options *
          </label>
          <div className="space-y-2">
            {(field.options || []).map((option, optionIndex) => (
              <div key={optionIndex} className="flex items-center space-x-2">
                <input
                  type="text"
                  value={option}
                  onChange={(e) => updateDropdownOption(index, optionIndex, e.target.value)}
                  placeholder={`Option ${optionIndex + 1}`}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => removeDropdownOption(index, optionIndex)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => addDropdownOption(index)}
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
            >
              <Plus className="h-4 w-4" />
              <span>Add Option</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );

  if (success) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Agent Created Successfully!</h2>
        <p className="text-gray-600 mb-4">
          Your AI agent has been uploaded to the marketplace and is now available for users to discover and run.
        </p>
        <p className="text-sm text-gray-500">
          Redirecting to your creator dashboard...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Upload New Agent
        </h1>
        <p className="text-gray-600">
          Share your AI agent with the community. Configure execution settings and define the inputs it needs.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex justify-center mb-6">
        <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('basic')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'basic' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Basic Info
          </button>
          <button
            onClick={() => setActiveTab('execution')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'execution' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Settings className="h-4 w-4 inline mr-1" />
            Execution
          </button>
          <button
            onClick={() => setActiveTab('inputs')}
            className={`px-4 py-2 rounded-md text-sm font-medium ${
              activeTab === 'inputs' 
                ? 'bg-white text-gray-900 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Input Fields
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Tab */}
        {activeTab === 'basic' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Agent Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="e.g., Social Media Content Generator"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what your agent does and what users can expect..."
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Execution Configuration Tab */}
        {activeTab === 'execution' && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg border p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Execution Settings</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Execution Webhook URL *
                  </label>
                  <input
                    type="url"
                    value={formData.execution_url}
                    onChange={(e) => handleInputChange('execution_url', e.target.value)}
                    placeholder="https://your-agent-endpoint.com/webhook"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    The webhook URL where your agent will receive execution requests.
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    HTTP Method *
                  </label>
                  <select
                    value={formData.http_method}
                    onChange={(e) => handleInputChange('http_method', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="POST">POST</option>
                    <option value="GET">GET</option>
                    <option value="PUT">PUT</option>
                    <option value="PATCH">PATCH</option>
                    <option value="DELETE">DELETE</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Headers Configuration */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Request Headers</h3>
                <button
                  type="button"
                  onClick={addHeader}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Header</span>
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Define custom headers for your agent requests (e.g., API keys, authentication).
              </p>
              
              <div className="space-y-3">
                {Object.entries(formData.headers).map(([key, value], index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => updateHeader(key, e.target.value, value)}
                      placeholder="Header name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateHeader(key, key, e.target.value)}
                      placeholder="Header value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeHeader(key)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {Object.keys(formData.headers).length === 0 && (
                  <p className="text-sm text-gray-500 italic">No headers configured</p>
                )}
              </div>
            </div>

            {/* Static Fields Configuration */}
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Static Fields</h3>
                <button
                  type="button"
                  onClick={addStaticField}
                  className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Field</span>
                </button>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Define static fields that will be included in every request (e.g., agent_id, session_id).
              </p>
              
              <div className="space-y-3">
                {Object.entries(formData.static_fields).map(([key, value], index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={key}
                      onChange={(e) => updateStaticField(key, e.target.value, value)}
                      placeholder="Field name"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => updateStaticField(key, key, e.target.value)}
                      placeholder="Field value"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <button
                      type="button"
                      onClick={() => removeStaticField(key)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                
                {Object.keys(formData.static_fields).length === 0 && (
                  <p className="text-sm text-gray-500 italic">No static fields configured</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Input Schema Tab */}
        {activeTab === 'inputs' && (
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Input Schema</h3>
              <button
                type="button"
                onClick={addSchemaField}
                className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
              >
                <Plus className="h-4 w-4" />
                <span>Add Field</span>
              </button>
            </div>
            
            <p className="text-sm text-gray-600 mb-4">
              Define the inputs your agent requires from users. These will be sent to your webhook along with static fields.
            </p>
            
            <div className="space-y-4">
              {formData.input_schema.map((field, index) => renderSchemaField(field, index))}
              
              {formData.input_schema.length === 0 && (
                <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                  <Bot className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No input fields defined yet</p>
                  <button
                    type="button"
                    onClick={addSchemaField}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 mx-auto"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Add First Field</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">Error</span>
            </div>
            <p className="text-red-600 mt-1">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/creator')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          
          <button
            type="submit"
            disabled={loading}
            className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Creating Agent...</span>
              </>
            ) : (
              <>
                <Upload className="h-4 w-4" />
                <span>Upload Agent</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AgentUploadForm; 