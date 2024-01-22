chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  if (request.action === 'getSpotifyInfo') {
    const songNameElement = document.querySelector('[data-testid="nowplaying-track-link"]');
    const artistNameElement = document.querySelector('[data-testid="nowplaying-artist"]');

    const songName = songNameElement ? songNameElement.innerText : '';
    const artistName = artistNameElement ? artistNameElement.innerText : '';

    sendResponse({ success: true, songName, artistName });
  }
});
