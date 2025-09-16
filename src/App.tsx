import React, { useState, useEffect } from 'react';
import TitleBar from './components/TitleBar';
import NavigationPanel from './components/NavigationPanel';
import ExtractionWidget from './components/ExtractionWidget';
import DataPanel from './components/DataPanel';
import StatusBar from './components/StatusBar';
import { ExtractedItem } from './types';

function App() {
  const [currentUrl, setCurrentUrl] = useState('');
  const [extractedData, setExtractedData] = useState<ExtractedItem[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);

  useEffect(() => {
    // Listen for global extraction start events
    if (window.electronAPI && window.electronAPI.onStartExtraction) {
      window.electronAPI.onStartExtraction(() => {
        setIsExtracting(true);
        // Additional logic to start extraction mode
      });
    }
  }, []);

  const handleNavigate = async (url: string) => {
    setCurrentUrl(url);
    try {
      if (window.electronAPI && window.electronAPI.navigateToUrl) {
        await window.electronAPI.navigateToUrl(url);
      } else {
        console.warn('Navigation not available in browser mode');
      }
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  const handleDataChange = (data: ExtractedItem[]) => {
    setExtractedData(data);
  };

  const saveExtractionSession = async () => {
    if (extractedData.length > 0 && currentUrl) {
      const session = {
        url: currentUrl,
        title: `Extraction from ${new URL(currentUrl).hostname}`,
        data: extractedData
      };

      try {
        if (window.electronAPI && window.electronAPI.insertExtraction) {
          await window.electronAPI.insertExtraction(session);
          console.log('Extraction session saved');
        } else {
          console.warn('Data saving not available in browser mode');
        }
      } catch (error) {
        console.error('Failed to save extraction session:', error);
      }
    }
  };

  useEffect(() => {
    if (extractedData.length > 0) {
      saveExtractionSession();
    }
  }, [extractedData]);

  return (
    <div className="h-screen bg-slate-900 flex flex-col overflow-hidden">
      {/* Custom Title Bar */}
      <TitleBar />

      {/* Main Content Area */}
      <div className="flex-1 flex">
        {/* Left Navigation Panel */}
        <NavigationPanel onNavigate={handleNavigate} currentUrl={currentUrl} />

        {/* Center Browser View */}
        <div className="flex-1 relative">
          {/* Browser view is handled by Electron BrowserView */}
          <div className="w-full h-full bg-slate-800 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-teal-400 to-cyan-500 rounded-2xl flex items-center justify-center">
                <div className="w-8 h-8 bg-slate-800 rounded-lg"></div>
              </div>
              <h2 className="text-slate-100 text-xl font-semibold mb-2">Advanced Data Extractor</h2>
              <p className="text-slate-400 mb-6">Enter a URL in the navigation panel to start extracting data</p>
              {!window.electronAPI && (
                <div className="mb-4 p-3 bg-yellow-400/10 border border-yellow-400/20 rounded-lg">
                  <p className="text-yellow-400 text-sm">
                    ⚠️ Running in browser mode. Build as desktop app for full functionality.
                  </p>
                </div>
              )}
              <div className="space-y-2 text-sm text-slate-500">
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-teal-400 rounded-full"></div>
                  <span>Point-and-click element selection</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                  <span>Smart template creation</span>
                </div>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span>Bulk data extraction</span>
                </div>
              </div>
            </div>
          </div>

          {/* Floating Extraction Widget */}
          <ExtractionWidget 
            extractedData={extractedData}
            onDataChange={handleDataChange}
            currentUrl={currentUrl}
          />
        </div>

        {/* Right Data Management Panel */}
        <DataPanel />
      </div>

      {/* Status Bar */}
      <StatusBar 
        currentUrl={currentUrl}
        extractedCount={extractedData.length}
        isExtracting={isExtracting}
      />
    </div>
  );
}

export default App;