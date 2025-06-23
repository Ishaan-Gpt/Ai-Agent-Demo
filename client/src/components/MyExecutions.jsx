import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Play, Download, Eye, Bot, Calendar } from 'lucide-react';
import axios from 'axios';

const MyExecutions = () => {
  const [executions, setExecutions] = useState([]);
  const [agents, setAgents] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, completed, failed

  useEffect(() => {
    fetchExecutions();
  }, []);

  const fetchExecutions = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/executions/user_001');
      setExecutions(response.data.executions);
      
      // Fetch agent details for each execution
      const agentIds = [...new Set(response.data.executions.map(exec => exec.agent_id))];
      const agentPromises = agentIds.map(id => axios.get(`/api/agents/${id}`));
      const agentResponses = await Promise.all(agentPromises);
      
      const agentsMap = {};
      agentResponses.forEach(response => {
        agentsMap[response.data.agent_id] = response.data;
      });
      setAgents(agentsMap);
    } catch (err) {
      setError('Failed to fetch executions');
      console.error('Error fetching executions:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredExecutions = executions.filter(execution => {
    if (filter === 'all') return true;
    if (filter === 'completed') return execution.status === 'completed';
    if (filter === 'failed') return execution.status === 'failed';
    return true;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'running':
        return <Clock className="h-5 w-5 text-yellow-600 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'failed':
        return 'Failed';
      case 'running':
        return 'Running';
      default:
        return 'Unknown';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'running':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  const getExecutionSummary = (execution) => {
    if (!execution.result) return 'No results available';
    
    if (execution.result.summary) {
      return execution.result.summary;
    }
    
    if (execution.result.text_output && execution.result.text_output.length > 0) {
      const firstOutput = execution.result.text_output[0];
      return firstOutput.content?.substring(0, 100) + '...' || 'Text output generated';
    }
    
    if (execution.result.media_links && execution.result.media_links.length > 0) {
      return `${execution.result.media_links.length} media files generated`;
    }
    
    return 'Results generated';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold mb-4">{error}</div>
        <button 
          onClick={fetchExecutions}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          My Executions
        </h1>
        <p className="text-gray-600">
          Track all your agent executions and their results
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold text-gray-900">{executions.length}</p>
            </div>
            <Bot className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {executions.filter(e => e.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Failed</p>
              <p className="text-2xl font-bold text-red-600">
                {executions.filter(e => e.status === 'failed').length}
              </p>
            </div>
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'all' 
              ? 'bg-blue-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          All ({executions.length})
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'completed' 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Completed ({executions.filter(e => e.status === 'completed').length})
        </button>
        <button
          onClick={() => setFilter('failed')}
          className={`px-4 py-2 rounded-lg font-medium ${
            filter === 'failed' 
              ? 'bg-red-600 text-white' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Failed ({executions.filter(e => e.status === 'failed').length})
        </button>
      </div>

      {/* Executions List */}
      <div className="space-y-4">
        {filteredExecutions.length === 0 ? (
          <div className="text-center py-12">
            <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No executions found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'all' 
                ? "You haven't run any agents yet." 
                : `No ${filter} executions found.`
              }
            </p>
            <Link
              to="/"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Browse Agents
            </Link>
          </div>
        ) : (
          filteredExecutions.map((execution) => (
            <div key={execution.execution_id} className="bg-white rounded-lg border hover:shadow-md transition-shadow duration-200">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(execution.status)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {agents[execution.agent_id]?.title || 'Unknown Agent'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {formatDate(execution.createdAt)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(execution.status)}`}>
                      {getStatusText(execution.status)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4">
                  {getExecutionSummary(execution)}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-4 w-4" />
                      <span>Execution ID: {execution.execution_id.slice(0, 8)}...</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {execution.status === 'completed' && (
                      <>
                        <Link
                          to={`/results/${execution.execution_id}`}
                          className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                        >
                          <Eye className="h-4 w-4" />
                          <span>View Results</span>
                        </Link>
                        <Link
                          to={`/agent/${execution.agent_id}`}
                          className="flex items-center space-x-1 text-green-600 hover:text-green-700"
                        >
                          <Play className="h-4 w-4" />
                          <span>Re-run</span>
                        </Link>
                      </>
                    )}
                    
                    {execution.status === 'failed' && (
                      <Link
                        to={`/agent/${execution.agent_id}`}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                      >
                        <Play className="h-4 w-4" />
                        <span>Try Again</span>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default MyExecutions; 