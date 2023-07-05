// content_script.js

// Spotify API credentials
const CLIENT_ID = '0ff4a8ef942f428c95638e2b47c77d21';
const CLIENT_SECRET = '06e2df97ea2847469c5eb3374963ce98';

// Discogs API credentials
const DISCOGS_API_ACCESS_TOKEN = 'IwPzRfHofYtmkiZuRZQsRhfuAPWqbpAUwhylRfmf';

// get the currently playing song information from the Spotify web player page
async function getCurrentSongInfo() {
  // obtain a Spotify API access token using the authorization code flow
  const spotifyApiAccessToken = await getSpotifyApiAccessToken();

  // query the Spotify API for the current track information using the access token
  const spotifyApiUrl = 'https://api.spotify.com/v1/me/player/currently-playing';
  const response = await fetch(spotifyApiUrl, {
    headers: {
      'Authorization': `Bearer ${spotifyApiAccessToken}`
    }
  });

  // parse the response and return the track information
  const data = await response.json();
  return {
    title: data.item.name,
    artist: data.item.artists[0].name
  };
}

currentSongTitle = getCurrentSongInfo()["title"]
currentSongArtist = getCurrentSongInfo()["artist"]

// construct the Spotify API query URL
const spotifyApiBaseUrl = 'https://api.spotify.com/v1/search';
const spotifyApiQuery = `${currentSongTitle} ${currentSongArtist}`;
const spotifyApiUrl = `${spotifyApiBaseUrl}?q=${encodeURIComponent(spotifyApiQuery)}&type=track&limit=1`;

// obtain a Spotify API access token using the authorization code flow
function getSpotifyApiAccessToken() {
  return new Promise((resolve, reject) => {
    // construct the authorization URL for the Spotify API
    const authBaseUrl = 'https://accounts.spotify.com/authorize';
    const authQueryParams = new URLSearchParams({
      'client_id': CLIENT_ID,
      'response_type': 'code',
      'redirect_uri': "http://localhost:3000",
      'scope': 'user-read-playback-state'
    });
    const authUrl = `${authBaseUrl}?${authQueryParams.toString()}`;

    // open a new tab to the authorization URL
    chrome.tabs.create({url: authUrl, selected: true}, tab => {
      // listen for the tab to complete loading and send a message with the authorization code
      chrome.tabs.onUpdated.addListener(function listener(tabId, changeInfo, tab) {
        if (tabId === tab.id && changeInfo.status === 'complete') {
          const codeRegex = /[?&]code=([^&]+)/;
          const codeMatch = tab.url.match(codeRegex);
          if (codeMatch) {
            const authorizationCode = codeMatch[1];
            chrome.tabs.remove(tabId);

            // exchange the authorization code for an access token
            const tokenBaseUrl = 'https://accounts.spotify.com/api/token';
            fetch(tokenBaseUrl, {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded'
              },
              body: new URLSearchParams({
                'grant_type': 'authorization_code',
                'code': authorizationCode,
                'redirect_uri': chrome.identity.getRedirectURL()
              })
            })
            .then(response => response.json())
            .then(data => resolve(data.access_token))
            .catch(error => reject(error));
          } else {
            reject(new Error('Authorization code not found'));
          }

          chrome.tabs.onUpdated.removeListener(listener);
        }
      });
    });
  });
}

// query the Spotify API for the track information using the access token
function querySpotifyApi(spotifyApiAccessToken) {
  return fetch(spotifyApiUrl, {
    headers: {
      'Authorization': `Bearer ${spotifyApiAccessToken}`
    }
  })
  .then(response => response.json())
  .then(data => {
    // extract the Spotify track ID from the API response
    const spotifyTrackId = data.tracks.items[0].id;
    return spotifyTrackId;
  });
}

// query the Discogs API for the release information using the track ID
function queryDiscogsApi(spotifyTrackId) {
  // construct the Discogs API query URL
  const discogsApiBaseUrl = 'https://api.discogs.com/';
  const discogsApiQuery = `https://api.discogs.com/database/search?q=${encodeURIComponent(currentSongTitle)} ${encodeURIComponent(currentSongArtist)}&type=release&per_page=1&token=${DISCOGS_API_ACCESS_TOKEN}`;
  const discogsApiUrl = `${discogsApiBaseUrl}database/search?q=${encodeURIComponent(spotifyTrackId)}&type=release&per_page=1`;

  // send the Discogs API query and extract the release URL from the response
  return fetch(discogsApiUrl)
    .then(response => response.json())
    .then(data => {
      const discogsReleaseUrl = data.results[0].uri;
      return discogsReleaseUrl;
    });
}

// main function to link the currently playing song in the Spotify web player to its Discogs for-sale listing
async function linkToDiscogsListing() {
  try {
    // obtain a Spotify API access token using the authorization code flow
    const spotifyApiAccessToken = await getSpotifyApiAccessToken();

    // query the Spotify API for the track information using the access token
    const spotifyTrackId = await querySpotifyApi(spotifyApiAccessToken);

    // query the Discogs API for the release information using the track ID
    const discogsReleaseUrl = await queryDiscogsApi(spotifyTrackId);

    // create a link to the Discogs for-sale listing and add it to the Spotify web player page
    const link = document.createElement('a');
    link.href = discogsReleaseUrl;
    link.target = '_blank';
    link.textContent = 'Buy on Discogs';
    link.style.marginLeft = '10px';
    const albumArt = document.querySelector('.now-playing__cover-art');
    albumArt.parentNode.insertBefore(link, albumArt.nextSibling);
  } catch (error) {
    console.error(error);
  }
}

// call the main function when the page has finished loading
window.addEventListener('load', linkToDiscogsListing);
