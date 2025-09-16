import React, { useState } from 'react';
import { Globe, Search, Bookmark, Settings, History, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

interface NavigationPanelProps {
  onNavigate: (url: string) => void;
  currentUrl: string;
}

const NavigationPanel: React.FC<NavigationPanelProps> = ({ onNavigate, currentUrl }) => {
  const [urlInput, setUrlInput] = useState('');
  const [recentUrls, setRecentUrls] = useState<string[]>([
    'https://example.com/products',
    'https://amazon.com',
    'https://ebay.com'
  ]);

  const handleNavigate = () => {
    if (urlInput) {
      let url = urlInput;
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      onNavigate(url);
      if (!recentUrls.includes(url)) {
        setRecentUrls([url, ...recentUrls.slice(0, 9)]);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNavigate();
    }
  };

  return (
    <div className="w-80 bg-slate-800/50 backdrop-blur-sm border-r border-slate-700 flex flex-col">
      {/* Navigation Header */}
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-slate-100 font-semibold text-sm mb-3 flex items-center">
          <Globe className="w-4 h-4 mr-2 text-teal-400" />
          Website Navigation
        </h2>
        
        {/* Browser Controls */}
        <div className="flex items-center space-x-2 mb-3">
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">
            <ChevronLeft className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors disabled:opacity-50">
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-lg transition-colors">
            <RotateCcw className="w-4 h-4 text-slate-400" />
          </button>
        </div>

        {/* URL Input */}
        <div className="relative">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Enter website URL..."
            className="w-full bg-slate-700 border border-slate-600 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-400 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
          />
          <button
            onClick={handleNavigate}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 hover:bg-slate-600 rounded-md transition-colors"
          >
            <Search className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Current URL Display */}
      {currentUrl && (
        <div className="p-4 border-b border-slate-700">
          <div className="text-xs text-slate-400 mb-1">Current URL:</div>
          <div className="text-sm text-teal-400 truncate">{currentUrl}</div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="p-4 border-b border-slate-700">
        <h3 className="text-slate-300 font-medium text-xs mb-2 flex items-center">
          <Bookmark className="w-3 h-3 mr-2" />
          QUICK ACTIONS
        </h3>
        <div className="space-y-2">
          <button className="w-full text-left text-sm text-slate-400 hover:text-teal-400 hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors">
            Start New Extraction
          </button>
          <button className="w-full text-left text-sm text-slate-400 hover:text-teal-400 hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors">
            Load Template
          </button>
          <button className="w-full text-left text-sm text-slate-400 hover:text-teal-400 hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors">
            Export Data
          </button>
        </div>
      </div>

      {/* Recent URLs */}
      <div className="p-4 flex-1">
        <h3 className="text-slate-300 font-medium text-xs mb-3 flex items-center">
          <History className="w-3 h-3 mr-2" />
          RECENT WEBSITES
        </h3>
        <div className="space-y-1">
          {recentUrls.map((url, index) => (
            <button
              key={index}
              onClick={() => onNavigate(url)}
              className="w-full text-left text-sm text-slate-400 hover:text-teal-400 hover:bg-slate-700/50 px-3 py-2 rounded-lg transition-colors truncate"
            >
              {url}
            </button>
          ))}
        </div>
      </div>

      {/* Settings */}
      <div className="p-4 border-t border-slate-700">
        <button className="w-full flex items-center text-slate-400 hover:text-teal-400 text-sm py-2 transition-colors">
          <Settings className="w-4 h-4 mr-2" />
          Settings & Preferences
        </button>
      </div>
    </div>
  );
};

export default NavigationPanel;