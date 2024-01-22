// When the popup loads, send a message to the content script
// requesting the album's URL for the currently playing song.
chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
  chrome.tabs.sendMessage(tabs[0].id, { action: 'getAlbumUrl' }, function (response) {
    // When the content script responds with the album URL, update the button's click event.
    if (response && response.albumUrl) {
      document.getElementById('orderButton').addEventListener('click', function () {
        // Open the Discogs page for the album in a new tab.
        chrome.tabs.create({ url: response.albumUrl });
      });
    } else {
      // Hide the button if the album URL is not available.
      document.getElementById('orderButton').style.display = 'none';
    }
  });
});
