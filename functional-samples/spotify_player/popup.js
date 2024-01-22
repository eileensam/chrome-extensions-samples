document.addEventListener('DOMContentLoaded', function () {
  chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    // Send a message to content script to get Spotify information
    chrome.tabs.sendMessage(tabs[0].id, { action: 'getSpotifyInfo' }, function (response) {
      if (response && response.success) {
        // Display Spotify information from the content script
        document.getElementById('song-name').innerText = response.songName;
        document.getElementById('artist-name').innerText = response.artistName;

        // Authenticate with Spotify API and get more details about the currently playing song
        authenticateSpotifyAPI(response.songName, response.artistName);
      } else {
        document.getElementById('song-name').innerText = 'Not playing';
        document.getElementById('artist-name').innerText = '';
      }
    });
  });
});

function authenticateSpotifyAPI(songName, artistName) {
  // Use your Spotify API credentials
  const clientId = '0ff4a8ef942f428c95638e2b47c77d21';
  const clientSecret = '06e2df97ea2847469c5eb3374963ce98';

  // Set up OAuth request to obtain access token
  const authString = btoa(`${clientId}:${clientSecret}`);
  const authHeaders = {
    'Content-Type': 'application/x-www-form-urlencoded',
    'Authorization': `Basic ${authString}`,
  };

  const authData = new URLSearchParams({
    'grant_type': 'client_credentials',
  });

  // Make request to Spotify API to get access token
  fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: authHeaders,
    body: authData,
  })
    .then(response => response.json())
    .then(data => {
      const accessToken = data.access_token;

      // Use the access token to get more details about the currently playing song
      getCurrentlyPlaying(accessToken, songName, artistName);
    })
    .catch(error => console.error('Error authenticating with Spotify API:', error));
}

function getCurrentlyPlaying(accessToken, songName, artistName) {
  // Make request to Spotify API to get information about the currently playing song
  fetch('https://api.spotify.com/v1/me/player/currently-playing', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
    },
  })
    .then(response => response.json())
    .then(data => {
      // Use the additional information from the Spotify API
      console.log('Currently playing song details:', data);
    })
    .catch(error => console.error('Error getting currently playing song:', error));
}
