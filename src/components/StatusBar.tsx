import React from 'react';
import { Activity, Wifi, Clock, HardDrive } from 'lucide-react';

interface StatusBarProps {
  currentUrl: string;
  extractedCount: number;
  isExtracting: boolean;
}

const StatusBar: React.FC<StatusBarProps> = ({ currentUrl, extractedCount, isExtracting }) => {
  return (
    <div className="h-8 bg-slate-900/95 backdrop-blur-sm border-t border-slate-700 flex items-center justify-between px-4 text-xs">
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${isExtracting ? 'bg-teal-400 animate-pulse' : 'bg-green-400'}`}></div>
          <span className="text-slate-400">
            {isExtracting ? 'Extracting...' : 'Ready'}
          </span>
        </div>
        
        {currentUrl && (
          <div className="flex items-center space-x-2">
            <Wifi className="w-3 h-3 text-slate-500" />
            <span className="text-slate-400 truncate max-w-md">{currentUrl}</span>
          </div>
        )}
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <HardDrive className="w-3 h-3 text-slate-500" />
          <span className="text-slate-400">{extractedCount} items extracted</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Clock className="w-3 h-3 text-slate-500" />
          <span className="text-slate-400">{new Date().toLocaleTimeString()}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Activity className="w-3 h-3 text-teal-400" />
          <span className="text-teal-400">Advanced Data Extractor v1.0.0</span>
        </div>
      </div>
    </div>
  );
};

export default StatusBar;