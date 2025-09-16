import React from 'react';
import { Minimize2, Maximize2, X } from 'lucide-react';

const TitleBar: React.FC = () => {
  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  };

  const handleMaximize = () => {
    window.electronAPI.maximizeWindow();
  };

  const handleClose = () => {
    window.electronAPI.closeWindow();
  };

  return (
    <div className="h-15 bg-slate-900/95 backdrop-blur-sm flex items-center justify-between px-4 border-b border-slate-700 drag-region">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-lg flex items-center justify-center">
          <div className="w-4 h-4 bg-slate-800 rounded-sm"></div>
        </div>
        <div>
          <h1 className="text-slate-100 font-semibold text-sm">Advanced Data Extractor</h1>
          <p className="text-slate-400 text-xs">Professional Web Scraping Tool</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-1 no-drag">
        <button
          onClick={handleMinimize}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
        >
          <Minimize2 className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
        </button>
        <button
          onClick={handleMaximize}
          className="p-2 hover:bg-slate-700 rounded-lg transition-colors group"
        >
          <Maximize2 className="w-4 h-4 text-slate-400 group-hover:text-slate-200" />
        </button>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-red-500 rounded-lg transition-colors group"
        >
          <X className="w-4 h-4 text-slate-400 group-hover:text-white" />
        </button>
      </div>
    </div>
  );
};

export default TitleBar;