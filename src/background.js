const BACKEND_URL = 'https://deer-content-quagga.ngrok-free.app';

const getNgrokHeader = () => ({
  'ngrok-skip-browser-warning': Math.random().toString(36).substring(2),
});

// Store latest tasks data
let latestTasks = [];

// Handle API requests from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'fetchTasks') {
    fetchTasks().then(sendResponse);
    return true; // Will respond asynchronously
  } else if (request.action === 'updateTask') {
    updateTask(request.taskId, request.actions).then(sendResponse);
    return true; // Will respond asynchronously
  } else if (request.action === 'getLatestTasks') {
    sendResponse({ success: true, data: latestTasks });
    return false; // Synchronous response
  } else if (request.action === 'configureBrowser') {
    configureBrowser(request.specifications, request.windowSize, sender.tab.id).then(sendResponse);
    return true; // Will respond asynchronously
  }
});

const configureBrowser = async (specifications, windowSize, tabId) => {
  try {
    console.log('Configuring browser with specifications:', specifications, 'and window size:', windowSize);

    // Get current window and screen info
    const tab = await chrome.tabs.get(tabId);
    const window = await chrome.windows.get(tab.windowId);

    const targetViewportWidth = specifications.viewport_width;
    const targetViewportHeight = specifications.viewport_height;
    const devicePixelRatio = specifications.device_pixel_ratio || 1;

    // Always use 0.8x zoom level
    const targetZoomLevel = 0.8;

    // Calculate the required tab viewport size to achieve target logical viewport at 0.8x zoom
    // At 0.8x zoom: tab_viewport * (1/0.8) = logical_viewport
    // So: tab_viewport = logical_viewport * 0.8
    const requiredTabViewportWidth = Math.round(targetViewportWidth * targetZoomLevel);
    const requiredTabViewportHeight = Math.round(targetViewportHeight * targetZoomLevel);

    console.log('Target logical viewport:', targetViewportWidth, 'x', targetViewportHeight);
    console.log('Required tab viewport at 0.8x zoom:', requiredTabViewportWidth, 'x', requiredTabViewportHeight);

    // Get current window dimensions to calculate chrome size
    const currentWindow = await chrome.windows.get(window.id);

    // Get current tab zoom level to calculate 100% zoom dimensions
    const currentZoom = await chrome.tabs.getZoom(tabId);
    console.log('Current tab zoom level:', currentZoom);

    // Use the provided windowSize parameter directly
    const currentViewport = {
      innerWidth: windowSize.innerWidth,
      innerHeight: windowSize.innerHeight,
      outerWidth: windowSize.outerWidth,
      outerHeight: windowSize.outerHeight
    };

    // Calculate 100% zoom dimensions from current zoom level
    const actualInnerWidth100 = Math.round(currentViewport.innerWidth * currentZoom);
    const actualInnerHeight100 = Math.round(currentViewport.innerHeight * currentZoom);

    const viewportAt100Zoom = {
      innerWidth: actualInnerWidth100,
      innerHeight: actualInnerHeight100,
      outerWidth: currentViewport.outerWidth,
      outerHeight: currentViewport.outerHeight
    };

    console.log('Current viewport (at current zoom):', currentViewport);
    console.log('Viewport at 100% zoom:', viewportAt100Zoom);

    console.log('Current viewport (at current zoom):', currentViewport);
    console.log('Viewport at 100% zoom:', viewportAt100Zoom);
    console.log('Current window:', currentWindow.width, 'x', currentWindow.height);

    // Calculate actual chrome dimensions using 100% zoom viewport data
    const actualChromeWidth = viewportAt100Zoom.outerWidth - viewportAt100Zoom.innerWidth;
    const actualChromeHeight = viewportAt100Zoom.outerHeight - viewportAt100Zoom.innerHeight;

    console.log('Calculated chrome dimensions:', actualChromeWidth, 'x', actualChromeHeight);

    // Calculate required window size to achieve the required tab viewport
    const requiredWindowWidth = requiredTabViewportWidth + actualChromeWidth;
    const requiredWindowHeight = requiredTabViewportHeight + actualChromeHeight;

    console.log('Required window size:', requiredWindowWidth, 'x', requiredWindowHeight);

    // Get screen dimensions for positioning and bounds checking
    const displays = await chrome.system.display.getInfo();
    const primaryDisplay = displays.find(d => d.isPrimary) || displays[0];
    const screenWidth = primaryDisplay.bounds.width;
    const screenHeight = primaryDisplay.bounds.height;

    // Check if window fits on screen
    const maxUsableWidth = screenWidth * 0.95;
    const maxUsableHeight = screenHeight * 0.95;

    let finalWindowWidth = requiredWindowWidth;
    let finalWindowHeight = requiredWindowHeight;
    let additionalScaling = 1;

    if (requiredWindowWidth > maxUsableWidth || requiredWindowHeight > maxUsableHeight) {
      const widthScale = maxUsableWidth / requiredWindowWidth;
      const heightScale = maxUsableHeight / requiredWindowHeight;
      additionalScaling = Math.min(widthScale, heightScale);

      finalWindowWidth = Math.floor(requiredWindowWidth * additionalScaling);
      finalWindowHeight = Math.floor(requiredWindowHeight * additionalScaling);

      console.log('Window too large for screen, applying scaling:', additionalScaling);
      console.log('Scaled window size:', finalWindowWidth, 'x', finalWindowHeight);
    }

    // Calculate window position (center on screen)
    const windowX = Math.max(0, Math.floor((screenWidth - finalWindowWidth) / 2));
    const windowY = Math.max(0, Math.floor((screenHeight - finalWindowHeight) / 2));

    // Override position if specified in task
    const finalX = specifications.browser_x !== undefined ? specifications.browser_x : windowX;
    const finalY = specifications.browser_y !== undefined ? specifications.browser_y : windowY;

    console.log('Setting window to:', finalWindowWidth, 'x', finalWindowHeight, 'at', finalX, ',', finalY);

    // First, restore window if it's maximized/fullscreen
    if (window.state === 'maximized' || window.state === 'fullscreen') {
      await chrome.windows.update(window.id, { state: 'normal' });
      // Wait a bit for the state change to take effect
      await new Promise(resolve => setTimeout(resolve, 300));
    }

    // Update window dimensions and position
    await chrome.windows.update(window.id, {
      width: finalWindowWidth,
      height: finalWindowHeight,
      left: finalX,
      top: finalY,
      state: 'normal'
    });

    console.log('Window resized to:', finalWindowWidth, 'x', finalWindowHeight, 'at', finalX, ',', finalY);

    // Wait for window resize to complete
    await new Promise(resolve => setTimeout(resolve, 200));

    // Apply zoom level (always 0.8x)
    const chromeZoomLevel = Math.log(targetZoomLevel) / Math.log(1.2);
    await chrome.tabs.setZoom(tabId, 0.8);
    console.log('Applied Chrome zoom level:', chromeZoomLevel, 'for zoom factor:', targetZoomLevel);

    // Verify the final viewport dimensions
    let finalViewport;
    try {
      const [finalResult] = await chrome.scripting.executeScript({
        target: { tabId: tabId },
        func: function () {
          // Use explicit window reference to avoid conflicts
          var win = this;
          if (typeof win.innerWidth === 'undefined') {
            win = window;
          }
          return {
            innerWidth: win.innerWidth || 0,
            innerHeight: win.innerHeight || 0,
            success: true
          };
        }
      });

      console.log('Verification script result:', finalResult);

      if (finalResult && finalResult.result && finalResult.result.innerWidth > 0 && finalResult.result.innerHeight > 0) {
        finalViewport = finalResult.result;
        console.log('Successfully verified viewport dimensions');
      } else {
        throw new Error('Invalid verification dimensions received');
      }
    } catch (error) {
      console.log('Verification failed, using calculated values:', error.message);
      finalViewport = {
        innerWidth: finalWindowWidth - actualChromeWidth,
        innerHeight: finalWindowHeight - actualChromeHeight
      };
    }

    console.log('Final tab viewport:', finalViewport.innerWidth, 'x', finalViewport.innerHeight);
    console.log('Expected logical viewport:', Math.round(finalViewport.innerWidth / 0.8), 'x', Math.round(finalViewport.innerHeight / 0.8));

    return {
      success: true,
      message: `Configured: ${finalViewport.innerWidth}x${finalViewport.innerHeight} tab viewport → ${targetViewportWidth}x${targetViewportHeight} logical (0.8x zoom)`
    };
  } catch (error) {
    console.error('Browser configuration error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

const fetchTasks = async () => {
  try {
    const response = await fetch(
      `${BACKEND_URL}/tasks/pending?limit=100&skip=0`,
      {
        method: 'POST',
        headers: getNgrokHeader(),
      }
    );
    if (!response.ok) throw new Error('Failed to fetch tasks');
    const data = await response.json();
    const sortedData = data.sort((a, b) => a.created_at - b.created_at);

    // Update latest tasks cache
    latestTasks = sortedData;

    return { success: true, data: sortedData };
  } catch (error) {
    console.error('Background fetch error:', error);
    return { success: false, error: error.message };
  }
};

// Periodic background fetching (every 5 seconds)
let backgroundInterval;

const startBackgroundFetching = () => {
  // Initial fetch
  fetchTasks();

  // Set up interval
  backgroundInterval = setInterval(() => {
    fetchTasks();
  }, 5000);
};

const stopBackgroundFetching = () => {
  if (backgroundInterval) {
    clearInterval(backgroundInterval);
    backgroundInterval = null;
  }
};

// Start background fetching when extension loads
startBackgroundFetching();

const updateTask = async (taskId, actions) => {
  try {
    const response = await fetch(`${BACKEND_URL}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...getNgrokHeader(),
      },
      body: JSON.stringify({
        status: 'processed',
        actions,
      }),
    });
    if (!response.ok) throw new Error('Failed to update task');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

chrome.action.onClicked.addListener(async (tab) => {
  if (!tab.url || tab.url.startsWith('chrome://')) {
    return;
  }

  try {
    await chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ['content.js']
    });
  } catch (error) {
    if (error.message.includes('Cannot access a chrome:// URL')) {
      console.log('Extension disabled on chrome:// pages');
    } else {
      console.error('Injection error:', error);
    }
  }
});
