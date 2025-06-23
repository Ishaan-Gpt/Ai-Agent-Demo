import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bot, BarChart3, Users, TrendingUp, Plus, Eye, Edit, Trash2, Calendar, Play } from 'lucide-react';
import axios from 'axios';

const CreatorDashboard = () => {
  const [agents, setAgents] = useState([]);
  const [executions, setExecutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedAgent, setSelectedAgent] = useState(null);

  // Simulated creator ID
  const creatorId = 'creator_123';

  useEffect(() => {
    fetchCreatorData();
  }, []);

  const fetchCreatorData = async () => {
    try {
      setLoading(true);
      
      // Fetch creator's agents
      const agentsResponse = await axios.get(`/api/creator/${creatorId}/agents`);
      setAgents(agentsResponse.data.agents);
      
      // Fetch all executions to calculate stats
      const executionsResponse = await axios.get('/api/executions/user_001');
      const allExecutions = executionsResponse.data.executions;
      
      // Filter executions for this creator's agents
      const creatorAgentIds = agentsResponse.data.agents.map(agent => agent.agent_id);
      const creatorExecutions = allExecutions.filter(exec => 
        creatorAgentIds.includes(exec.agent_id)
      );
      setExecutions(creatorExecutions);
      
    } catch (err) {
      setError('Failed to fetch creator data');
      console.error('Error fetching creator data:', err);
    } finally {
      setLoading(false);
    }
  };

  const getAgentStats = (agentId) => {
    const agentExecutions = executions.filter(exec => exec.agent_id === agentId);
    const completed = agentExecutions.filter(exec => exec.status === 'completed').length;
    const failed = agentExecutions.filter(exec => exec.status === 'failed').length;
    const total = agentExecutions.length;
    
    return {
      total,
      completed,
      failed,
      successRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  const getOverallStats = () => {
    const totalAgents = agents.length;
    const totalExecutions = executions.length;
    const completedExecutions = executions.filter(exec => exec.status === 'completed').length;
    const successRate = totalExecutions > 0 ? Math.round((completedExecutions / totalExecutions) * 100) : 0;
    
    return {
      totalAgents,
      totalExecutions,
      completedExecutions,
      successRate
    };
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
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
          onClick={fetchCreatorData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  const stats = getOverallStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Creator Dashboard
          </h1>
          <p className="text-gray-600">
            Manage your AI agents and track their performance
          </p>
        </div>
        
        <Link
          to="/upload"
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <Plus className="h-5 w-5" />
          <span>Upload New Agent</span>
        </Link>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Agents</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalAgents}</p>
            </div>
            <Bot className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Executions</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalExecutions}</p>
            </div>
            <BarChart3 className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completedExecutions}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Success Rate</p>
              <p className="text-2xl font-bold text-blue-600">{stats.successRate}%</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Your Agents</h2>
        </div>
        
        <div className="divide-y">
          {agents.length === 0 ? (
            <div className="p-6 text-center">
              <Bot className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No agents yet</h3>
              <p className="text-gray-600 mb-4">
                Start by uploading your first AI agent to the marketplace.
              </p>
              <Link
                to="/upload"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Upload Agent
              </Link>
            </div>
          ) : (
            agents.map((agent) => {
              const agentStats = getAgentStats(agent.agent_id);
              return (
                <div key={agent.agent_id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <Bot className="h-6 w-6 text-blue-600" />
                        <h3 className="text-lg font-semibold text-gray-900">{agent.title}</h3>
                        <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                          Active
                        </span>
                      </div>
                      
                      <p className="text-gray-600 mb-3">{agent.description}</p>
                      
                      <div className="flex items-center space-x-6 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created {formatDate(agent.created_at)}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Play className="h-4 w-4" />
                          <span>{agentStats.total} executions</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <TrendingUp className="h-4 w-4" />
                          <span>{agentStats.successRate}% success rate</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/agent/${agent.agent_id}`}
                        className="flex items-center space-x-1 text-blue-600 hover:text-blue-700"
                        title="View Agent"
                      >
                        <Eye className="h-4 w-4" />
                        <span>View</span>
                      </Link>
                      
                      <button
                        onClick={() => setSelectedAgent(agent)}
                        className="flex items-center space-x-1 text-gray-600 hover:text-gray-700"
                        title="Edit Agent"
                      >
                        <Edit className="h-4 w-4" />
                        <span>Edit</span>
                      </button>
                      
                      <button
                        className="flex items-center space-x-1 text-red-600 hover:text-red-700"
                        title="Delete Agent"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                  
                  {/* Agent Stats */}
                  <div className="mt-4 grid grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-gray-500">Total Runs</p>
                      <p className="text-lg font-semibold text-gray-900">{agentStats.total}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-green-600">Completed</p>
                      <p className="text-lg font-semibold text-green-700">{agentStats.completed}</p>
                    </div>
                    <div className="bg-red-50 rounded-lg p-3">
                      <p className="text-xs font-medium text-red-600">Failed</p>
                      <p className="text-lg font-semibold text-red-700">{agentStats.failed}</p>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Recent Executions */}
      {executions.length > 0 && (
        <div className="bg-white rounded-lg border">
          <div className="p-6 border-b">
            <h2 className="text-xl font-semibold text-gray-900">Recent Executions</h2>
          </div>
          
          <div className="divide-y">
            {executions.slice(0, 5).map((execution) => (
              <div key={execution.execution_id} className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-gray-900">
                      {agents.find(a => a.agent_id === execution.agent_id)?.title || 'Unknown Agent'}
                    </h4>
                    <p className="text-sm text-gray-500">
                      {formatDate(execution.createdAt)} • Execution ID: {execution.execution_id.slice(0, 8)}...
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      execution.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : execution.status === 'failed'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {execution.status}
                    </span>
                    
                    {execution.status === 'completed' && (
                      <Link
                        to={`/results/${execution.execution_id}`}
                        className="text-blue-600 hover:text-blue-700 text-sm"
                      >
                        View Results
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatorDashboard; 