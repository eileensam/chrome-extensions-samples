// contentScript.js

// Send a message to the background script
chrome.runtime.sendMessage({ type: 'getAlbumInfo' }, function(response) {
  if (response.success) {
    console.log('Album info received successfully.');
    // Perform any actions or logic with the received response from the background script
  }
});
