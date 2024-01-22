chrome.runtime.onInstalled.addListener(() => {
  console.log('Spotify Discogs Order extension installed!');
});

// Listen for messages from the content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'getAlbumUrl') {
    // Extract the necessary information from the Spotify web player page
    // to construct the search query for the album on Discogs.
    const albumName = message.albumName;
    const artistName = message.artistName;

    // Make an HTTP request to the Discogs API to search for the album.
    // Replace <YOUR_DISCOGS_API_KEY> with your actual API key.
    const discogsApiUrl = `https://api.discogs.com/database/search?key=kyetGqvKKhlMjDEEdnnd&q=${encodeURIComponent(albumName + ' ' + artistName)}&type=release`;

    // Use the fetch API to send the HTTP request.
    fetch(discogsApiUrl)
      .then((response) => response.json())
      .then((data) => {
        if (data.results.length > 0) {
          // Extract the URL of the first result from the Discogs API response.
          const albumUrl = data.results[0].uri;

          // Send the album URL back to the content script.
          sendResponse({ albumUrl });
        } else {
          sendResponse({});
        }
      })
      .catch((error) => {
        console.error(error);
        sendResponse({});
      });

    // Return true to indicate that the response will be sent asynchronously.
    return true;
  }
});
