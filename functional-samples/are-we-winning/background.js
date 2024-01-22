// background.js

// Set the initial condition state
chrome.storage.local.set({ condition: true });

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.updateCondition !== undefined) {
    // Update the condition based on the message
    chrome.storage.local.set({ condition: request.updateCondition });
  }
});

// Function to toggle the condition state every 5 seconds
setInterval(() => {
  chrome.storage.local.get('condition', ({ condition }) => {
    const newCondition = !condition;
    chrome.storage.local.set({ condition: newCondition });
  });
}, 5000);

// Listen for changes to the condition state
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === "local" && changes.condition) {
    const newCondition = changes.condition.newValue;

    // Set the icon based on the new condition state
    const iconPath = newCondition ? "winning.png" : "losing.png";
    chrome.action.setIcon({ path: { 16: iconPath } });
  }
});
