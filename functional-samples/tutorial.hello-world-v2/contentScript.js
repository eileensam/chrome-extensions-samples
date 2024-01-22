// Listen for messages from the popup or background script.
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  if (message.action === 'getAlbumUrl') {
    // Extract the necessary information from the Spotify web player page
    // to construct the search query for the album on Discogs.
    const albumName = document.querySelector('.track-info__name').innerText;
    const artistName = document.querySelector('.track-info__artists').innerText;

    // Make an HTTP request to the Discogs API to search for the album.
    // Replace <YOUR_DISCOGS_API_KEY> with your actual API key.
    const discogsApiUrl = `https://api.discogs.com/database/search?key=kyetGqvKKhlMjDEEdnnd&q=${encodeURIComponent(albumName + ' ' + artistName)}&type=release`;

    // Use the axios library to send the HTTP request.
    axios.get(discogsApiUrl)
      .then(function (response) {
        if (response.data.results.length > 0) {
          // Extract the URL of the first result from the Discogs API response.
          const albumUrl = response.data.results[0].uri;

          // Send the album URL back to the popup.
          sendResponse({ albumUrl });
        } else {
          sendResponse({});
        }
      })
      .catch(function (error) {
        console.error(error);
        sendResponse({});
      });

    // Return true to indicate that the response will be sent asynchronously.
    return true;
  }
});
