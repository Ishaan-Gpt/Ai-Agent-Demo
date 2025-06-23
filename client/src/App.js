import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, Users, Bot, Plus, BarChart3 } from 'lucide-react';

// Import components
import AgentBrowser from './components/AgentBrowser';
import AgentForm from './components/AgentForm';
import ExecutionResults from './components/ExecutionResults';
import MyExecutions from './components/MyExecutions';
import CreatorDashboard from './components/CreatorDashboard';
import AgentUploadForm from './components/AgentUploadForm';
import ChatInterface from './components/ChatInterface';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Navigation */}
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
                <Link to="/" className="flex items-center space-x-2">
                  <Bot className="h-8 w-8 text-blue-600" />
                  <span className="text-xl font-bold text-gray-900">AI Agent Marketplace</span>
                </Link>
              </div>
              
              <div className="flex items-center space-x-8">
                <Link to="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <Home className="h-5 w-5" />
                  <span>Browse Agents</span>
                </Link>
                <Link to="/my-runs" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <Users className="h-5 w-5" />
                  <span>My Runs</span>
                </Link>
                <Link to="/creator" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900">
                  <BarChart3 className="h-5 w-5" />
                  <span>Creator Dashboard</span>
                </Link>
                <Link to="/upload" className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                  <Plus className="h-5 w-5" />
                  <span>Upload Agent</span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <Routes>
            <Route path="/" element={<AgentBrowser />} />
            <Route path="/agent/:agentId" element={<AgentForm />} />
            <Route path="/results/:executionId" element={<ExecutionResults />} />
            <Route path="/my-runs" element={<MyExecutions />} />
            <Route path="/creator" element={<CreatorDashboard />} />
            <Route path="/upload" element={<AgentUploadForm />} />
            <Route path="/chat/:agentId" element={<ChatInterface />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App; 