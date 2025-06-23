import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, Download, Share2, Copy, Image, FileText, Video, Link as LinkIcon } from 'lucide-react';
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

const ExecutionResults = () => {
  const { executionId } = useParams();
  const navigate = useNavigate();
  const [execution, setExecution] = useState(null);
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchExecution();
  }, [executionId]);

  const fetchExecution = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/executions/user_001/${executionId}`);
      setExecution(response.data.execution);
      
      // Fetch agent details
      const agentResponse = await axios.get(`/api/agents/${response.data.execution.agent_id}`);
      setAgent(agentResponse.data);
    } catch (err) {
      setError('Failed to fetch execution results');
      console.error('Error fetching execution:', err);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const downloadResult = (content, filename) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const renderMediaContent = (media) => {
    if (!media || !Array.isArray(media)) return null;

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {media.map((item, index) => (
          <div key={index} className="bg-white rounded-lg border p-4">
            {item.type === 'image' && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Image className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Image {index + 1}</span>
                </div>
                <img 
                  src={item.url} 
                  alt={item.alt || `Generated image ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                {item.description && (
                  <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                )}
              </div>
            )}
            
            {item.type === 'video' && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <Video className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Video {index + 1}</span>
                </div>
                <video 
                  src={item.url} 
                  controls
                  className="w-full h-48 object-cover rounded-lg"
                >
                  Your browser does not support the video tag.
                </video>
                {item.description && (
                  <p className="text-sm text-gray-600 mt-2">{item.description}</p>
                )}
              </div>
            )}
            
            {item.type === 'file' && (
              <div>
                <div className="flex items-center space-x-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">{item.filename || `File ${index + 1}`}</span>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-600">{item.description || 'Generated file'}</p>
                  <button
                    onClick={() => downloadResult(item.content, item.filename)}
                    className="mt-2 flex items-center space-x-1 text-blue-600 hover:text-blue-700 text-sm"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderTextContent = (textContent) => {
    if (!textContent || !Array.isArray(textContent)) return null;

    return (
      <div className="space-y-4">
        {textContent.map((item, index) => (
          <div key={index} className="bg-white rounded-lg border p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">{item.title || `Output ${index + 1}`}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => copyToClipboard(item.content)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Copy to clipboard"
                >
                  <Copy className="h-4 w-4" />
                </button>
                <button
                  onClick={() => downloadResult(item.content, `${item.title || 'output'}.txt`)}
                  className="text-gray-400 hover:text-gray-600"
                  title="Download"
                >
                  <Download className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="bg-gray-50 p-3 rounded-lg">
              <pre className="text-sm text-gray-800 whitespace-pre-wrap">{item.content}</pre>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !execution) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg font-semibold mb-4">{error || 'Execution not found'}</div>
        <button 
          onClick={() => navigate('/my-runs')}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Back to My Runs
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => navigate('/my-runs')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back to My Runs</span>
        </button>
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Execution Results
            </h1>
            <p className="text-gray-600">
              {agent?.title} • {new Date(execution.createdAt).toLocaleString()}
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="text-sm font-medium">Completed</span>
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Status Card */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <span className="font-medium text-green-800">Execution completed successfully</span>
        </div>
        <p className="text-green-700 mt-1">
          Agent processed your inputs and generated the results below.
        </p>
      </div>

      {/* Input Summary */}
      <div className="bg-white rounded-lg border p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Input Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(execution.inputs).map(([key, value]) => (
            <div key={key}>
              <dt className="text-sm font-medium text-gray-500">{key.replace(/_/g, ' ')}</dt>
              <dd className="text-sm text-gray-900 mt-1">{String(value)}</dd>
            </div>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="space-y-6">
        {/* Main Response - Display the actual response text */}
        {execution.result?.response && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Response</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div 
                className="text-gray-800 text-lg leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderMarkdown(execution.result.response) }}
              />
            </div>
          </div>
        )}

        {execution.result?.summary && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Summary</h3>
            <p className="text-gray-700">{execution.result.summary}</p>
          </div>
        )}

        {execution.result?.text_output && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Text Output</h3>
            <div
              className="text-gray-800 text-lg leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: renderMarkdown(
                  Array.isArray(execution.result.text_output)
                    ? execution.result.text_output.join('\n')
                    : execution.result.text_output
                )
              }}
            />
          </div>
        )}

        {execution.result?.media_links && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Media Output</h3>
            {renderMediaContent(execution.result.media_links)}
          </div>
        )}

        {/* Raw Result - Only show if needed for debugging */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Result (Debug)</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <pre className="text-sm text-gray-800 overflow-x-auto">
                {JSON.stringify(execution.result, null, 2)}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExecutionResults; 