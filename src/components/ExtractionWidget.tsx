import React, { useState, useEffect } from 'react';
import { Image, Type, FileText, DollarSign, MousePointer, Grid, Save, Download, Trash2 } from 'lucide-react';
import { ExtractedItem, ExtractionTemplate } from '../types';

interface ExtractionWidgetProps {
  extractedData: ExtractedItem[];
  onDataChange: (data: ExtractedItem[]) => void;
  currentUrl: string;
}

const ExtractionWidget: React.FC<ExtractionWidgetProps> = ({ 
  extractedData, 
  onDataChange, 
  currentUrl 
}) => {
  const [extractionMode, setExtractionMode] = useState<'manual' | 'template'>('manual');
  const [selectedFieldType, setSelectedFieldType] = useState<string>('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [templates, setTemplates] = useState<ExtractionTemplate[]>([]);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      if (window.electronAPI && window.electronAPI.getTemplates) {
        const loadedTemplates = await window.electronAPI.getTemplates();
        setTemplates(loadedTemplates.map((t: any) => ({
          ...t,
          selectors: JSON.parse(t.selectors)
        })));
      } else {
        // Fallback for browser environment
        console.warn('Running in browser mode - templates not available');
        setTemplates([]);
      }
    } catch (error) {
      console.error('Failed to load templates:', error);
      setTemplates([]);
    }
  };

  const handleFieldSelection = (fieldType: string) => {
    setSelectedFieldType(fieldType);
    setIsExtracting(true);
    
    // Start element selection mode in browser view
    // This would communicate with the browser preload script
  };

  const addExtractedItem = (item: ExtractedItem) => {
    const newItem = {
      ...item,
      id: Date.now().toString(),
    };
    onDataChange([...extractedData, newItem]);
    setIsExtracting(false);
    setSelectedFieldType('');
  };

  const removeItem = (id: string) => {
    onDataChange(extractedData.filter(item => item.id !== id));
  };

  const updateItemValue = (id: string, value: string) => {
    onDataChange(extractedData.map(item => 
      item.id === id ? { ...item, value } : item
    ));
  };

  const saveAsTemplate = async () => {
    if (!templateName.trim()) return;

    const template: ExtractionTemplate = {
      name: templateName,
      selectors: extractedData.reduce((acc, item) => {
        acc[item.type] = item.selector;
        return acc;
      }, {} as any)
    };

    try {
      if (window.electronAPI && window.electronAPI.saveTemplate) {
        await window.electronAPI.saveTemplate(template);
        await loadTemplates();
        setTemplateName('');
      } else {
        console.warn('Template saving not available in browser mode');
      }
    } catch (error) {
      console.error('Failed to save template:', error);
    }
  };

  const exportData = async (format: 'json' | 'csv') => {
    try {
      if (window.electronAPI && window.electronAPI.exportData) {
        await window.electronAPI.exportData(extractedData, format);
      } else {
        // Fallback for browser - download as file
        const data = format === 'json' 
          ? JSON.stringify(extractedData, null, 2)
          : convertToCSV(extractedData);
        
        const blob = new Blob([data], { type: format === 'json' ? 'application/json' : 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `extraction-data.${format}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export data:', error);
    }
  };

  const convertToCSV = (data: ExtractedItem[]): string => {
    if (data.length === 0) return '';
    
    const headers = ['type', 'selector', 'value', 'url'];
    const csvHeaders = headers.join(',');
    
    const csvRows = data.map(row => {
      return headers.map(header => {
        const value = row[header as keyof ExtractedItem] || '';
        return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value;
      }).join(',');
    });
    
    return [csvHeaders, ...csvRows].join('\n');
  };

  const fieldTypes = [
    { type: 'image', icon: Image, label: 'Image', color: 'text-blue-400' },
    { type: 'title', icon: Type, label: 'Title', color: 'text-purple-400' },
    { type: 'description', icon: FileText, label: 'Description', color: 'text-green-400' },
    { type: 'price', icon: DollarSign, label: 'Price', color: 'text-yellow-400' },
  ];

  return (
    <div className="fixed top-20 right-6 w-96 bg-slate-800/95 backdrop-blur-sm border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
      {/* Header */}
      <div className="p-4 border-b border-slate-700">
        <h2 className="text-slate-100 font-semibold text-sm mb-3 flex items-center">
          <MousePointer className="w-4 h-4 mr-2 text-teal-400" />
          Data Extraction Widget
        </h2>

        {/* Mode Toggle */}
        <div className="flex bg-slate-700 rounded-lg p-1">
          <button
            onClick={() => setExtractionMode('manual')}
            className={`flex-1 text-xs px-3 py-2 rounded-md transition-colors ${
              extractionMode === 'manual'
                ? 'bg-teal-400 text-slate-900 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Manual
          </button>
          <button
            onClick={() => setExtractionMode('template')}
            className={`flex-1 text-xs px-3 py-2 rounded-md transition-colors ${
              extractionMode === 'template'
                ? 'bg-teal-400 text-slate-900 font-medium'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Template
          </button>
        </div>
      </div>

      {/* Field Selection */}
      {extractionMode === 'manual' && (
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-slate-300 font-medium text-xs mb-2">SELECT FIELD TYPE</h3>
          <div className="grid grid-cols-2 gap-2">
            {fieldTypes.map(({ type, icon: Icon, label, color }) => (
              <button
                key={type}
                onClick={() => handleFieldSelection(type)}
                className={`flex items-center space-x-2 p-3 rounded-lg border transition-all ${
                  selectedFieldType === type
                    ? 'border-teal-400 bg-teal-400/10 text-teal-400'
                    : 'border-slate-600 hover:border-slate-500 text-slate-400 hover:text-slate-300'
                } ${isExtracting && selectedFieldType === type ? 'animate-pulse' : ''}`}
              >
                <Icon className={`w-4 h-4 ${selectedFieldType === type ? 'text-teal-400' : color}`} />
                <span className="text-xs font-medium">{label}</span>
              </button>
            ))}
          </div>
          
          {isExtracting && (
            <div className="mt-3 p-3 bg-teal-400/10 border border-teal-400/20 rounded-lg">
              <p className="text-teal-400 text-xs font-medium">
                Click on any element in the webpage to extract {selectedFieldType} data
              </p>
            </div>
          )}
        </div>
      )}

      {/* Template Mode */}
      {extractionMode === 'template' && (
        <div className="p-4 border-b border-slate-700">
          <h3 className="text-slate-300 font-medium text-xs mb-2">TEMPLATES</h3>
          <div className="space-y-2">
            {templates.map((template) => (
              <button
                key={template.id}
                className="w-full text-left p-3 bg-slate-700/50 hover:bg-slate-700 rounded-lg transition-colors border border-slate-600"
              >
                <div className="text-slate-200 text-sm font-medium">{template.name}</div>
                <div className="text-slate-400 text-xs mt-1">
                  {Object.keys(template.selectors).join(', ')}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Extracted Data */}
      <div className="p-4 max-h-80 overflow-y-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-slate-300 font-medium text-xs">EXTRACTED DATA ({extractedData.length})</h3>
          {extractedData.length > 0 && (
            <button
              onClick={() => onDataChange([])}
              className="text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          )}
        </div>

        {extractedData.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <Grid className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No data extracted yet</p>
            <p className="text-xs mt-1">Select a field type and click on elements</p>
          </div>
        ) : (
          <div className="space-y-3">
            {extractedData.map((item) => {
              const fieldType = fieldTypes.find(f => f.type === item.type);
              const Icon = fieldType?.icon || Type;
              
              return (
                <div key={item.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Icon className={`w-4 h-4 ${fieldType?.color || 'text-slate-400'}`} />
                      <span className="text-slate-300 text-xs font-medium capitalize">
                        {item.type}
                      </span>
                    </div>
                    <button
                      onClick={() => removeItem(item.id!)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  
                  <input
                    type="text"
                    value={item.value}
                    onChange={(e) => updateItemValue(item.id!, e.target.value)}
                    className="w-full bg-slate-600 border border-slate-500 rounded px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-teal-400"
                  />
                  
                  <div className="text-slate-400 text-xs mt-1 truncate">
                    {item.selector}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Actions */}
      {extractedData.length > 0 && (
        <div className="p-4 border-t border-slate-700 space-y-3">
          {/* Save Template */}
          <div className="flex space-x-2">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Template name..."
              className="flex-1 bg-slate-700 border border-slate-600 rounded px-2 py-1 text-slate-100 text-xs focus:outline-none focus:border-teal-400"
            />
            <button
              onClick={saveAsTemplate}
              disabled={!templateName.trim()}
              className="px-3 py-1 bg-teal-400 hover:bg-teal-500 disabled:bg-slate-600 disabled:text-slate-400 text-slate-900 rounded text-xs font-medium transition-colors"
            >
              <Save className="w-3 h-3" />
            </button>
          </div>

          {/* Export Buttons */}
          <div className="flex space-x-2">
            <button
              onClick={() => exportData('json')}
              className="flex-1 flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded px-3 py-2 text-slate-300 text-xs font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>JSON</span>
            </button>
            <button
              onClick={() => exportData('csv')}
              className="flex-1 flex items-center justify-center space-x-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded px-3 py-2 text-slate-300 text-xs font-medium transition-colors"
            >
              <Download className="w-3 h-3" />
              <span>CSV</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExtractionWidget;