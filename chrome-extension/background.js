chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'captureStep') {
    const step = message.step;

    // Capture the active tab visual visible area
    chrome.tabs.captureVisibleTab(null, { format: 'jpeg', quality: 80 }, (dataUrl) => {
      if (chrome.runtime.lastError || !dataUrl) {
        console.warn("Screenshot capture blocked or failed", chrome.runtime.lastError);
        saveStep(step); // Save without customScreenshot if blocked (e.g. system tabs)
      } else {
        step.customScreenshot = dataUrl;
        saveStep(step);
      }
    });
  }
});

function saveStep(step) {
  chrome.storage.local.get(['steps'], (result) => {
    const currentSteps = result.steps || [];
    step.id = `step-chrome-${Date.now()}-${currentSteps.length + 1}`;
    currentSteps.push(step);
    
    chrome.storage.local.set({ steps: currentSteps }, () => {
      // Send message to popup to update badge count live
      chrome.runtime.sendMessage({ action: 'stepsUpdated', count: currentSteps.length });
    });
  });
}
