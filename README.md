# Advanced Data Extractor

A professional Electron.js desktop application for web data extraction with advanced capabilities that replicates and enhances Chrome extension functionality.

## Features

### Core Capabilities
- **Smart Element Selection**: Point-and-click element selection with intelligent CSS selector generation
- **Dual Extraction Modes**: Manual element-by-element selection and template-based bulk extraction
- **Real-time Highlighting**: Visual element highlighting with selection indicators
- **Data Management**: SQLite database integration for local storage and session management

### Advanced Features
- **Template System**: Create reusable extraction templates for similar websites
- **Multiple Export Formats**: Export data as JSON, CSV, or sync to external APIs
- **Background Processing**: Schedule extraction tasks and monitor websites for changes
- **System Integration**: Global shortcuts, system tray, and native notifications

### Professional UI
- **Modern Dark Theme**: Beautiful interface with glassmorphism effects
- **Floating Widget**: Chrome extension-style floating extraction panel
- **Three-Panel Layout**: Navigation, browser view, and data management
- **Responsive Design**: Optimized for various screen sizes

## Technology Stack

- **Electron**: Cross-platform desktop framework
- **React + TypeScript**: Modern UI framework with type safety
- **Tailwind CSS**: Utility-first CSS framework
- **SQLite**: Local database for data persistence
- **Cheerio**: Server-side HTML parsing
- **Puppeteer**: Headless browser automation

## Installation

### Development Setup

1. **Clone and Install**:
   ```bash
   git clone <repository-url>
   cd advanced-data-extractor
   npm install
   ```

2. **Development Mode**:
   ```bash
   npm run dev
   ```
   This starts both the Vite development server and Electron application.

### Building for Production

1. **Build All Components**:
   ```bash
   npm run build
   ```

2. **Create Distribution Packages**:
   ```bash
   # For all platforms
   npm run dist
   
   # Platform-specific
   npm run dist:win    # Windows installer
   npm run dist:mac    # macOS DMG
   npm run dist:linux  # Linux AppImage
   ```

## Usage

### Getting Started

1. **Launch the Application**: Start the app and enter a website URL in the navigation panel
2. **Select Elements**: Use the floating widget to select field types (Image, Title, Description, Price)
3. **Point and Click**: Click on webpage elements to extract data
4. **Manage Data**: View, edit, and export extracted data from the data panel

### Extraction Modes

#### Manual Mode
- Select individual elements by field type
- Real-time data preview and editing
- Smart selector generation for reliability

#### Template Mode
- Create reusable extraction patterns
- Bulk extraction from similar page structures
- Template library for common websites

### Data Management

- **Local Storage**: All extractions saved to SQLite database
- **Export Options**: JSON (Chrome extension compatible), CSV
- **Session History**: Track all extraction sessions with timestamps
- **Search & Filter**: Easily find past extractions

## Architecture

### Main Process (`src/main/main.ts`)
- Window management and system integration
- Database operations and file handling
- Global shortcuts and system tray
- Browser view management

### Preload Scripts
- **`preload.ts`**: Main window API bridge
- **`browserPreload.ts`**: Element selection and highlighting logic

### Renderer Process (`src/components/`)
- **TitleBar**: Custom window controls
- **NavigationPanel**: Website navigation and URL management
- **ExtractionWidget**: Floating data extraction interface
- **DataPanel**: Extracted data management and export
- **StatusBar**: Application status and statistics

## Key Features Implementation

### Smart Element Selection
```typescript
// Intelligent CSS selector generation
function generateSmartSelector(element: Element): string {
  // Priority: ID → Classes → Data attributes → Structural selectors
  if (element.id) return `#${element.id}`;
  // ... additional logic for robust selection
}
```

### Real-time Highlighting
```css
.element-highlight {
  outline: 2px solid #4DEAC7 !important;
  background-color: rgba(77, 234, 199, 0.1) !important;
  animation: highlight-pulse 2s infinite;
}
```

### Template System
```typescript
interface ExtractionTemplate {
  name: string;
  selectors: {
    image?: string;
    title?: string;
    description?: string;
    price?: string;
  };
  containerSelector?: string;
}
```

## Build Configuration

The application uses `electron-builder` for creating distribution packages:

- **Windows**: NSIS installer (.exe)
- **macOS**: DMG package with code signing support
- **Linux**: AppImage for universal compatibility

## Development Commands

```bash
npm run dev          # Development mode
npm run build        # Build all components
npm run pack         # Create unpacked app
npm run dist         # Create distribution packages
npm run lint         # Code linting
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

For support and feature requests, please open an issue on the GitHub repository.