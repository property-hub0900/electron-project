// Browser preload script for element selection and highlighting
(function() {
  let currentHighlight: HTMLElement | null = null;
  let selectionMode = false;
  let onElementSelect: ((element: Element) => void) | null = null;

  // Smart CSS selector generation
  function generateSmartSelector(element: Element): string {
    // Try ID first
    if (element.id) {
      return `#${element.id}`;
    }

    // Try unique class combinations
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) {
        const selector = `.${classes.join('.')}`;
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }
    }

    // Try data attributes
    for (const attr of element.attributes) {
      if (attr.name.startsWith('data-')) {
        const selector = `[${attr.name}="${attr.value}"]`;
        if (document.querySelectorAll(selector).length === 1) {
          return selector;
        }
      }
    }

    // Try structural selectors
    const tagName = element.tagName.toLowerCase();
    let selector = tagName;
    
    let current = element;
    while (current.parentElement) {
      const parent = current.parentElement;
      const siblings = Array.from(parent.children).filter(child => 
        child.tagName.toLowerCase() === current.tagName.toLowerCase()
      );
      
      if (siblings.length > 1) {
        const index = siblings.indexOf(current as Element) + 1;
        selector = `${parent.tagName.toLowerCase()} > ${current.tagName.toLowerCase()}:nth-child(${index})${selector === tagName ? '' : ' ' + selector}`;
      } else {
        selector = `${parent.tagName.toLowerCase()} > ${selector}`;
      }
      
      current = parent;
      
      // Test if selector is unique
      if (document.querySelectorAll(selector).length === 1) {
        return selector;
      }
    }

    return selector;
  }

  function highlightElement(element: Element) {
    // Remove previous highlight
    if (currentHighlight) {
      currentHighlight.style.outline = '';
      currentHighlight.style.backgroundColor = '';
      const indicator = currentHighlight.querySelector('.selection-indicator');
      if (indicator) indicator.remove();
    }

    // Add highlight to new element
    const htmlElement = element as HTMLElement;
    htmlElement.style.outline = '2px solid #4DEAC7';
    htmlElement.style.backgroundColor = 'rgba(77, 234, 199, 0.1)';
    
    // Add selection indicator
    const indicator = document.createElement('div');
    indicator.className = 'selection-indicator';
    indicator.style.cssText = `
      position: absolute;
      top: -12px;
      right: -12px;
      background: #4DEAC7;
      color: #1e293b;
      border-radius: 50%;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 12px;
      font-weight: bold;
      z-index: 9999;
      pointer-events: none;
    `;
    indicator.textContent = '✓';
    
    htmlElement.style.position = 'relative';
    htmlElement.appendChild(indicator);
    
    currentHighlight = htmlElement;
  }

  function startSelectionMode(callback: (element: Element) => void) {
    selectionMode = true;
    onElementSelect = callback;
    document.body.style.cursor = 'crosshair';
    
    // Add visual overlay
    const overlay = document.createElement('div');
    overlay.id = 'selection-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(30, 41, 59, 0.1);
      z-index: 9998;
      pointer-events: none;
    `;
    document.body.appendChild(overlay);
  }

  function stopSelectionMode() {
    selectionMode = false;
    onElementSelect = null;
    document.body.style.cursor = '';
    
    const overlay = document.getElementById('selection-overlay');
    if (overlay) overlay.remove();
  }

  function extractElementData(element: Element): any {
    const data: any = {
      selector: generateSmartSelector(element),
      tagName: element.tagName.toLowerCase(),
      text: element.textContent?.trim() || '',
      html: element.innerHTML
    };

    // Extract specific data types
    if (element.tagName.toLowerCase() === 'img') {
      data.type = 'image';
      data.src = (element as HTMLImageElement).src;
      data.alt = (element as HTMLImageElement).alt;
    } else if (element.tagName.toLowerCase() === 'a') {
      data.type = 'link';
      data.href = (element as HTMLAnchorElement).href;
    } else {
      // Detect content type
      const text = data.text.toLowerCase();
      if (text.includes('$') || text.includes('price') || /\d+\.\d{2}/.test(text)) {
        data.type = 'price';
      } else if (element.closest('h1, h2, h3, h4, h5, h6') || element.matches('h1, h2, h3, h4, h5, h6')) {
        data.type = 'title';
      } else if (text.length > 50) {
        data.type = 'description';
      } else {
        data.type = 'text';
      }
    }

    return data;
  }

  // Event listeners for element selection
  document.addEventListener('mouseover', (e) => {
    if (selectionMode && e.target instanceof Element) {
      highlightElement(e.target);
    }
  });

  document.addEventListener('click', (e) => {
    if (selectionMode && e.target instanceof Element) {
      e.preventDefault();
      e.stopPropagation();
      
      const data = extractElementData(e.target);
      if (onElementSelect) {
        onElementSelect(data);
      }
      
      stopSelectionMode();
    }
  });

  // Global functions accessible from main process
  (window as any).startSelectionMode = startSelectionMode;
  (window as any).stopSelectionMode = stopSelectionMode;
  (window as any).highlightElement = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      highlightElement(element);
    }
  };
  (window as any).extractData = (selector: string) => {
    const element = document.querySelector(selector);
    if (element) {
      return extractElementData(element);
    }
  };
})();