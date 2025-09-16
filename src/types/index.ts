export interface ExtractedItem {
  id?: string;
  type: 'image' | 'title' | 'description' | 'price' | 'text' | 'link';
  selector: string;
  value: string;
  url?: string;
  position?: { x: number; y: number };
}

export interface ExtractionTemplate {
  id?: number;
  name: string;
  selectors: {
    image?: string;
    title?: string;
    description?: string;
    price?: string;
  };
  containerSelector?: string;
  createdAt?: string;
}

export interface ExtractionSession {
  id?: number;
  url: string;
  title?: string;
  data: ExtractedItem[];
  templateName?: string;
  createdAt?: string;
}

export interface DatabaseAPI {
  insertExtraction: (data: ExtractionSession) => Promise<any>;
  getExtractions: () => Promise<ExtractionSession[]>;
  saveTemplate: (template: ExtractionTemplate) => Promise<any>;
  getTemplates: () => Promise<ExtractionTemplate[]>;
}

export interface ElectronAPI {
  insertExtraction: (data: any) => Promise<any>;
  getExtractions: () => Promise<any[]>;
  saveTemplate: (template: any) => Promise<any>;
  getTemplates: () => Promise<any[]>;
  navigateToUrl: (url: string) => Promise<void>;
  getPageContent: () => Promise<string>;
  highlightElement: (selector: string) => Promise<void>;
  exportData: (data: any, format: string) => Promise<string>;
  minimizeWindow: () => void;
  maximizeWindow: () => void;
  closeWindow: () => void;
  onStartExtraction: (callback: () => void) => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}