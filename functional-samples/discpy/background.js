// background.js

// Listen for messages from the content script
chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
  if (message.type === 'getAlbumInfo') {
    // Perform any necessary operations with the received message
    // For example, you could store the album info in the extension's state or perform other background tasks.

    // Once the background tasks are completed, you can optionally send a response back to the content script.
    sendResponse({ success: true });
  }
});
