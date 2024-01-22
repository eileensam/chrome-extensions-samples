// contentScript.js

chrome.runtime.onInstalled.addListener(function () {
  chrome.declarativeContent.onPageChanged.removeRules(undefined, function () {
    chrome.declarativeContent.onPageChanged.addRules([
      {
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostEquals: 'open.spotify.com' },
          }),
        ],
        actions: [new chrome.declarativeContent.ExecuteScript({ script: 'content_script.js' })],
      },
    ]);
  });
});

// Function to extract the currently playing album information from the Spotify web player
function getCurrentAlbumInfo() {
  const albumElement = document.querySelector('[data-testid="playbar-info-title"]');
  const artistElement = document.querySelector('[data-testid="playbar-info-artist"]');

  if (albumElement && artistElement) {
    const album = albumElement.textContent.trim();
    const artist = artistElement.textContent.trim();
    return { album, artist };
  }

  return null;
}

// Function to open a new tab with the Discogs search results for the specified album and artist
function searchOnDiscogs(album, artist) {
  const discogsSearchUrl = 'https://www.discogs.com/search/?q=${encodeURIComponent(' +
    album + ' ' + artist +
  ')}&type=release';
  window.open(discogsSearchUrl, '_blank');
}

// Main function to handle the plugin's behavior
function main() {
    console.log('Content script is running.');
  const currentAlbumInfo = getCurrentAlbumInfo();

  if (currentAlbumInfo) {
    searchOnDiscogs(currentAlbumInfo.album, currentAlbumInfo.artist);
  }
}

// Execute the main function when the DOM is ready
window.addEventListener('DOMContentLoaded', main);
