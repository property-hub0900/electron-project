import React, { useState, useEffect } from 'react';
import { Database, Download, FileText, Trash2, Eye, EyeOff } from 'lucide-react';

interface ExtractedItem {
  id: string;
  url: string;
  timestamp: number;
  data: {
    image?: string;
    title?: string;
    description?: string;
    price?: string;
  };
}

interface ExtractionSession {
  id: string;
  name: string;
  url: string;
  timestamp: number;
  itemCount: number;
  items: ExtractedItem[];
}

export const DataPanel: React.FC = () => {
  const [sessions, setSessions] = useState<ExtractionSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoading(true);
      // Check if we're in Electron environment
      if (typeof window !== 'undefined' && window.electronAPI) {
        const data = await window.electronAPI.getExtractions();
        setSessions(data || []);
      } else {
        // Fallback for browser environment - use mock data
        const mockSessions: ExtractionSession[] = [
          {
            id: '1',
            name: 'Sample Extraction',
            url: 'https://example.com',
            timestamp: Date.now(),
            itemCount: 0,
            items: []
          }
        ];
        setSessions(mockSessions);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const exportSession = async (sessionId: string, format: 'json' | 'csv') => {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;

    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.exportData(session.items, format);
      } else {
        // Fallback for browser - download as file
        const data = format === 'json' 
          ? JSON.stringify(session.items, null, 2)
          : convertToCSV(session.items);
        
        const blob = new Blob([data], { 
          type: format === 'json' ? 'application/json' : 'text/csv' 
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `extraction-${sessionId}.${format}`;
        a.click();
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  const convertToCSV = (items: ExtractedItem[]): string => {
    if (items.length === 0) return '';
    
    const headers = ['URL', 'Timestamp', 'Image', 'Title', 'Description', 'Price'];
    const rows = items.map(item => [
      item.url,
      new Date(item.timestamp).toISOString(),
      item.data.image || '',
      item.data.title || '',
      item.data.description || '',
      item.data.price || ''
    ]);
    
    return [headers, ...rows].map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
  };

  const deleteSession = async (sessionId: string) => {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        await window.electronAPI.deleteExtraction(sessionId);
      }
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (selectedSession === sessionId) {
        setSelectedSession(null);
      }
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  const selectedSessionData = sessions.find(s => s.id === selectedSession);

  if (isCollapsed) {
    return (
      <div className="w-12 bg-slate-800 border-l border-slate-700 flex flex-col items-center py-4">
        <button
          onClick={() => setIsCollapsed(false)}
          className="p-2 text-slate-400 hover:text-teal-400 transition-colors"
          title="Expand Data Panel"
        >
          <Eye className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="w-80 bg-slate-800 border-l border-slate-700 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-slate-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-5 h-5 text-teal-400" />
          <h2 className="text-lg font-semibold text-slate-100">Extracted Data</h2>
        </div>
        <button
          onClick={() => setIsCollapsed(true)}
          className="p-1 text-slate-400 hover:text-teal-400 transition-colors"
          title="Collapse Panel"
        >
          <EyeOff className="w-4 h-4" />
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-sm font-medium text-slate-300 mb-3">Extraction Sessions</h3>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin w-6 h-6 border-2 border-teal-400 border-t-transparent rounded-full mx-auto"></div>
              <p className="text-slate-400 text-sm mt-2">Loading sessions...</p>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8">
              <Database className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-slate-400 text-sm">No extractions yet</p>
              <p className="text-slate-500 text-xs mt-1">Start extracting data to see results here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {sessions.map((session) => (
                <div
                  key={session.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedSession === session.id
                      ? 'bg-teal-500/10 border-teal-400/30'
                      : 'bg-slate-700/50 border-slate-600 hover:bg-slate-700'
                  }`}
                  onClick={() => setSelectedSession(session.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium text-slate-200 truncate">
                      {session.name}
                    </h4>
                    <span className="text-xs text-slate-400">
                      {session.itemCount} items
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate">{session.url}</p>
                  <p className="text-xs text-slate-500 mt-1">
                    {new Date(session.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Session Details */}
        {selectedSessionData && (
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-slate-300">Session Details</h3>
                <div className="flex gap-1">
                  <button
                    onClick={() => exportSession(selectedSessionData.id, 'json')}
                    className="p-1.5 text-slate-400 hover:text-teal-400 transition-colors"
                    title="Export as JSON"
                  >
                    <FileText className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => exportSession(selectedSessionData.id, 'csv')}
                    className="p-1.5 text-slate-400 hover:text-teal-400 transition-colors"
                    title="Export as CSV"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteSession(selectedSessionData.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete Session"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="text-xs text-slate-400 space-y-1">
                <p>URL: {selectedSessionData.url}</p>
                <p>Items: {selectedSessionData.itemCount}</p>
                <p>Date: {new Date(selectedSessionData.timestamp).toLocaleString()}</p>
              </div>
            </div>

            {/* Extracted Items */}
            <div className="flex-1 overflow-y-auto p-4">
              {selectedSessionData.items.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 text-sm">No items extracted</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedSessionData.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-slate-700/30 rounded-lg border border-slate-600"
                    >
                      {item.data.image && (
                        <img
                          src={item.data.image}
                          alt="Extracted"
                          className="w-full h-20 object-cover rounded mb-2"
                        />
                      )}
                      {item.data.title && (
                        <h5 className="text-sm font-medium text-slate-200 mb-1">
                          {item.data.title}
                        </h5>
                      )}
                      {item.data.description && (
                        <p className="text-xs text-slate-400 mb-1 line-clamp-2">
                          {item.data.description}
                        </p>
                      )}
                      {item.data.price && (
                        <p className="text-sm font-semibold text-teal-400">
                          {item.data.price}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataPanel;