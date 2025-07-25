import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Wait for DOM to be ready
function initializeApp() {
    const rootElement = document.getElementById('task-assistant-root');
    
    if (!rootElement) {
        // Retry if element not found
        setTimeout(initializeApp, 100);
        return;
    }

    // Render the app
    const root = ReactDOM.createRoot(rootElement as HTMLElement);
    
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}

// Initialize when script loads
initializeApp();