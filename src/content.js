// Persistent state management
let persistentState = {
    isVisible: false,
    position: { top: 20, left: 20 }
};

// Check if overlay already exists (for navigation persistence)
let toggleButton = document.getElementById('task-assistant-toggle');
let overlay = document.getElementById('task-assistant-overlay');

// Create toggle button if it doesn't exist
if (!toggleButton) {
    toggleButton = document.createElement('div');
    toggleButton.id = 'task-assistant-toggle';
    toggleButton.innerHTML = '📋';
    toggleButton.title = 'Toggle Task Assistant';
    toggleButton.style.cssText = `
        position: fixed !important;
        bottom: 20px !important;
        right: 20px !important;
        z-index: 2147483647 !important;
        width: 50px !important;
        height: 50px !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        cursor: pointer !important;
        font-size: 20px !important;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        border: none !important;
        backdrop-filter: blur(10px) !important;
    `;
    
    // Add hover effects
    toggleButton.addEventListener('mouseenter', () => {
        toggleButton.style.transform = 'scale(1.1)';
        toggleButton.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)';
    });
    
    toggleButton.addEventListener('mouseleave', () => {
        toggleButton.style.transform = 'scale(1)';
        toggleButton.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    });
    
    document.body.appendChild(toggleButton);
}

// Create overlay container if it doesn't exist
if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'task-assistant-overlay';
    overlay.style.display = persistentState.isVisible ? 'block' : 'none';
    overlay.style.cssText = `
        position: fixed !important;
        top: ${persistentState.position.top}px !important;
        left: ${persistentState.position.left}px !important;
        z-index: 2147483646 !important;
        width: 420px !important;
        height: 800px !important;
        background: rgba(255, 255, 255, 0.7) !important;
        border: none !important;
        border-radius: 16px !important;
        box-shadow: 0 10px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.8) !important;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        backdrop-filter: blur(20px) !important;
        -webkit-backdrop-filter: blur(20px) !important;
        overflow: hidden !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
        pointer-events: auto !important;
    `;
    document.body.appendChild(overlay);

    // Create overlay header with improved styling
    const header = document.createElement('header');
    header.style.cssText = `
        margin: 0 !important;
        padding: 8px 16px !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        border-radius: 16px 16px 0 0 !important;
        cursor: move !important;
        user-select: none !important;
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        min-height: 40px !important;
    `;
    
    header.innerHTML = `
        <h3 style="margin: 0; color: white; font-size: 14px; font-weight: 600; letter-spacing: 0.5px;">
            ✨ Tasks
        </h3>
        <button id="close-button" style="
            background: rgba(255,255,255,0.2) !important;
            border: none !important;
            border-radius: 6px !important;
            width: 24px !important;
            height: 24px !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            font-size: 14px !important;
            cursor: pointer !important;
            color: white !important;
            transition: all 0.2s ease !important;
        ">×</button>
    `;
    
    // Add close button hover effect
    const closeBtn = header.querySelector('#close-button');
    closeBtn.addEventListener('mouseenter', () => {
        closeBtn.style.background = 'rgba(255,255,255,0.3)';
        closeBtn.style.transform = 'scale(1.1)';
    });
    closeBtn.addEventListener('mouseleave', () => {
        closeBtn.style.background = 'rgba(255,255,255,0.2)';
        closeBtn.style.transform = 'scale(1)';
    });
    
    overlay.appendChild(header);

    // Create mount point for React with improved styling
    const appRoot = document.createElement('div');
    appRoot.id = 'task-assistant-root';
    appRoot.style.cssText = `
        height: calc(100% - 40px) !important;
        overflow: hidden !important;
        background: rgba(255, 255, 255, 0.9) !important;
        border-radius: 0 0 16px 16px !important;
    `;
    overlay.appendChild(appRoot);
}

// Inject styles if not already present
if (!document.getElementById('task-assistant-styles')) {
    const styleLink = document.createElement('link');
    styleLink.id = 'task-assistant-styles';
    styleLink.rel = 'stylesheet';
    styleLink.href = chrome.runtime.getURL('styles/overlay.css');
    document.head.appendChild(styleLink);
}

// Toggle functionality
function toggleOverlay() {
    persistentState.isVisible = !persistentState.isVisible;
    overlay.style.display = persistentState.isVisible ? 'block' : 'none';
    toggleButton.innerHTML = persistentState.isVisible ? '✕' : '📋';
    
    // Save state to storage for persistence across page reloads
    chrome.storage.local.set({ 
        taskAssistantState: persistentState 
    });
}

// Load persistent state from storage
chrome.storage.local.get(['taskAssistantState'], (result) => {
    if (result.taskAssistantState) {
        // Merge with defaults, ensuring position values are numeric
        const savedState = result.taskAssistantState;
        persistentState = { 
            ...persistentState, 
            ...savedState,
            position: {
                top: typeof savedState.position?.top === 'string' ? 
                    parseInt(savedState.position.top) : (savedState.position?.top || 20),
                left: typeof savedState.position?.left === 'string' ? 
                    parseInt(savedState.position.left) : (savedState.position?.left || 20)
            }
        };
        
        overlay.style.display = persistentState.isVisible ? 'block' : 'none';
        overlay.style.top = persistentState.position.top + 'px';
        overlay.style.left = persistentState.position.left + 'px';
        toggleButton.innerHTML = persistentState.isVisible ? '✕' : '📋';
        
        // Re-initialize dragging after position is set
        setTimeout(() => makeDraggable(), 100);
    }
});

// Event listeners
toggleButton.addEventListener('click', toggleOverlay);
const header = overlay.querySelector('header');
const closeButton = header.querySelector('#close-button');
closeButton.addEventListener('click', toggleOverlay);

// Make overlay draggable
function makeDraggable() {
    let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    let isDragging = false;
    let header = null;

    function initializeDragging() {
        header = overlay.querySelector('header');
        if (!header) {
            // Retry if header not found yet
            setTimeout(initializeDragging, 100);
            return;
        }
        
        // Remove any existing listeners first
        header.removeEventListener('mousedown', dragMouseDown);
        header.addEventListener('mousedown', dragMouseDown, { passive: false });
    }

    function dragMouseDown(e) {
        // Don't drag when clicking close button
        if (e.target.id === 'close-button' || e.target.closest('#close-button')) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        isDragging = true;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Add dragging visual feedback
        overlay.style.transform = 'scale(1.01)';
        overlay.style.boxShadow = '0 20px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.9)';
        overlay.style.transition = 'none'; // Disable transition during drag
        if (header) header.style.cursor = 'grabbing';
        document.body.style.userSelect = 'none';
        document.body.style.cursor = 'grabbing';
        
        // Add event listeners to document to catch mouse movements outside overlay
        document.addEventListener('mouseup', closeDragElement, { passive: false });
        document.addEventListener('mousemove', elementDrag, { passive: false });
    }

    function elementDrag(e) {
        if (!isDragging) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        // Calculate movement delta
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        
        // Get current position from style or computed style
        const currentTop = parseInt(overlay.style.top) || overlay.offsetTop;
        const currentLeft = parseInt(overlay.style.left) || overlay.offsetLeft;
        
        // Calculate new position
        let newTop = currentTop - pos2;
        let newLeft = currentLeft - pos1;
        
        // Constrain to viewport with padding
        const padding = 10;
        const overlayRect = overlay.getBoundingClientRect();
        const maxTop = window.innerHeight - overlayRect.height - padding;
        const maxLeft = window.innerWidth - overlayRect.width - padding;
        
        newTop = Math.max(padding, Math.min(newTop, maxTop));
        newLeft = Math.max(padding, Math.min(newLeft, maxLeft));
        
        // Apply new position immediately
        overlay.style.top = newTop + "px";
        overlay.style.left = newLeft + "px";
        
        // Update persistent state
        persistentState.position = {
            top: newTop,
            left: newLeft
        };
    }

    function closeDragElement(e) {
        if (!isDragging) return;
        
        isDragging = false;
        
        // Remove event listeners
        document.removeEventListener('mouseup', closeDragElement);
        document.removeEventListener('mousemove', elementDrag);
        
        // Reset visual feedback
        overlay.style.transform = 'scale(1)';
        overlay.style.boxShadow = '0 10px 40px rgba(0,0,0,0.25), 0 0 0 1px rgba(255,255,255,0.8)';
        overlay.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'; // Re-enable transition
        if (header) header.style.cursor = 'move';
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        
        // Save position to storage
        chrome.storage.local.set({ 
            taskAssistantState: persistentState 
        });
    }

    // Initialize dragging
    initializeDragging();
}

// Initialize draggable functionality
makeDraggable();

// Handle window resize to keep overlay within bounds
window.addEventListener('resize', () => {
    if (!overlay || overlay.style.display === 'none') return;
    
    const padding = 10;
    const overlayRect = overlay.getBoundingClientRect();
    
    let newTop = parseInt(overlay.style.top) || 20;
    let newLeft = parseInt(overlay.style.left) || 20;
    
    const maxTop = window.innerHeight - overlayRect.height - padding;
    const maxLeft = window.innerWidth - overlayRect.width - padding;
    
    newTop = Math.max(padding, Math.min(newTop, maxTop));
    newLeft = Math.max(padding, Math.min(newLeft, maxLeft));
    
    if (newTop !== parseInt(overlay.style.top) || newLeft !== parseInt(overlay.style.left)) {
        overlay.style.top = newTop + 'px';
        overlay.style.left = newLeft + 'px';
        
        persistentState.position = { top: newTop, left: newLeft };
        chrome.storage.local.set({ taskAssistantState: persistentState });
    }
});

// Message bridge between injected script and extension
window.addEventListener('message', async (event) => {
    // Only accept messages from same origin
    if (event.source !== window) return;
    
    if (event.data.type && event.data.type === 'FROM_REACT_APP') {
        try {
            const response = await chrome.runtime.sendMessage(event.data.payload);
            window.postMessage({
                type: 'FROM_CONTENT_SCRIPT',
                id: event.data.id,
                response: response
            }, '*');
        } catch (error) {
            window.postMessage({
                type: 'FROM_CONTENT_SCRIPT',
                id: event.data.id,
                error: error.message
            }, '*');
        }
    } else if (event.data.type === 'CONFIGURE_BROWSER') {
        // Handle browser configuration
        configureBrowser(event.data.specifications, event.data.windowSize);
    }
});

// Browser configuration function
function configureBrowser(specifications, windowSize) {
    try {
        console.log('Configuring browser with specifications:', specifications, windowSize);
        
        // Send message to background script to handle window resizing
        chrome.runtime.sendMessage({
            action: 'configureBrowser',
            specifications: specifications,
            windowSize: windowSize
        }).then(response => {
            if (response.success) {
                console.log('Browser configured successfully');
                
                // Apply scroll position after a short delay to ensure page is loaded
                setTimeout(() => {
                    if (specifications.scroll_x !== undefined || specifications.scroll_y !== undefined) {
                        window.scrollTo(
                            specifications.scroll_x || 0, 
                            specifications.scroll_y || 0
                        );
                    }
                }, 500);
                
                // Show configuration feedback
                showBrowserConfigFeedback(specifications);
            } else {
                console.error('Failed to configure browser:', response.error);
            }
        }).catch(error => {
            console.error('Error configuring browser:', error);
        });
        
    } catch (error) {
        console.error('Error in configureBrowser:', error);
    }
}

// Show visual feedback when browser is configured
function showBrowserConfigFeedback(specifications) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed !important;
        top: 20px !important;
        left: 50% !important;
        transform: translateX(-50%) !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        padding: 12px 20px !important;
        border-radius: 8px !important;
        font-size: 14px !important;
        font-weight: 600 !important;
        z-index: 2147483648 !important;
        pointer-events: none !important;
        animation: browser-config-fade 4s ease-out forwards !important;
        box-shadow: 0 4px 20px rgba(102,126,234,0.3) !important;
        max-width: 400px !important;
        text-align: center !important;
    `;
    
    feedback.innerHTML = `
        🖥️ Browser Configured<br>
        <span style="font-size: 12px; opacity: 0.9; line-height: 1.4;">
            Viewport: ${specifications.viewport_width}x${specifications.viewport_height}<br>
            Position: ${specifications.browser_x || 'auto'}, ${specifications.browser_y || 'auto'} • 
            Scroll: ${specifications.scroll_x || 0}, ${specifications.scroll_y || 0}<br>
            DPR: ${specifications.device_pixel_ratio || 1}x
        </span>
    `;
    
    // Add CSS animation if not already present
    if (!document.getElementById('browser-config-styles')) {
        const style = document.createElement('style');
        style.id = 'browser-config-styles';
        style.textContent = `
            @keyframes browser-config-fade {
                0% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
                15% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0px);
                }
                85% {
                    opacity: 1;
                    transform: translateX(-50%) translateY(0px);
                }
                100% {
                    opacity: 0;
                    transform: translateX(-50%) translateY(-20px);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    // Remove feedback after animation
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 4000);
}

// Handle URL changes and navigation
let currentUrl = window.location.href;

// Detect URL changes (for SPAs and navigation)
const urlChangeHandler = () => {
    if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log('URL changed, maintaining overlay state');
        
        // Ensure overlay persists after navigation
        if (!document.getElementById('task-assistant-overlay')) {
            // Re-inject if DOM was cleared
            location.reload();
        }
    }
};

// Multiple ways to detect navigation
window.addEventListener('popstate', urlChangeHandler);
window.addEventListener('pushstate', urlChangeHandler);
window.addEventListener('replacestate', urlChangeHandler);

// Observer for DOM changes that might remove our overlay
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
            // Check if our elements still exist
            if (!document.getElementById('task-assistant-overlay') || !document.getElementById('task-assistant-toggle')) {
                console.log('Overlay removed from DOM, re-creating...');
                // Re-inject the content script
                setTimeout(() => location.reload(), 100);
            }
        }
    });
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true
});

// Inject React app if not already present
if (!document.querySelector('script[src*="app.js"]')) {
    const script = document.createElement('script');
    script.src = chrome.runtime.getURL('app.js');
    script.type = 'module';
    document.head.appendChild(script);
}

// Add Alt+C hotkey to capture current mouse position
let currentMousePos = { x: 0, y: 0 };

// Track mouse position continuously
document.addEventListener('mousemove', (e) => {
    currentMousePos.x = e.clientX;
    currentMousePos.y = e.clientY;
});

// Handle Alt+C keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.altKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        e.stopPropagation();
        
        // Calculate scroll height (h parameter)
        const scrollHeight = Math.max(
            document.body.scrollHeight,
            document.body.offsetHeight,
            document.documentElement.clientHeight,
            document.documentElement.scrollHeight,
            document.documentElement.offsetHeight
        );
        
        // Create draft action
        const draftAction = {
            action: 'click',
            x: currentMousePos.x,
            y: currentMousePos.y,
            h: window.scrollY
        };
        
        // Send message to React app to add draft action
        window.postMessage({
            type: 'ADD_DRAFT_ACTION',
            action: draftAction
        }, '*');
        
        // Show visual feedback
        showClickCaptureFeedback(currentMousePos.x, currentMousePos.y);
        
        // Open overlay if it's closed
        if (!persistentState.isVisible) {
            toggleOverlay();
        }
    }
});

// Show visual feedback when Alt+C is pressed
function showClickCaptureFeedback(x, y) {
    const feedback = document.createElement('div');
    feedback.style.cssText = `
        position: fixed !important;
        left: ${x - 10}px !important;
        top: ${y - 10}px !important;
        width: 20px !important;
        height: 20px !important;
        background: #667eea !important;
        border: 2px solid white !important;
        border-radius: 50% !important;
        z-index: 2147483648 !important;
        pointer-events: none !important;
        animation: capture-pulse 0.6s ease-out forwards !important;
    `;
    
    // Add CSS animation
    if (!document.getElementById('capture-feedback-styles')) {
        const style = document.createElement('style');
        style.id = 'capture-feedback-styles';
        style.textContent = `
            @keyframes capture-pulse {
                0% {
                    transform: scale(1);
                    opacity: 1;
                }
                50% {
                    transform: scale(2);
                    opacity: 0.7;
                }
                100% {
                    transform: scale(3);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(feedback);
    
    // Remove feedback after animation
    setTimeout(() => {
        if (feedback.parentNode) {
            feedback.parentNode.removeChild(feedback);
        }
    }, 600);
}