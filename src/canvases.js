const axios = require('axios');
const querystring = require('querystring');
const getCanvases = require('./_canvasApi.js');

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;


module.exports = async (req, res) => {
  let canvases = [];  // response array
  let canvasToken = getCanvasToken();
  let personalToken = await getPersonalToken();
  let rpTracks = await getRecentlyPlayed(personalToken);
  // remove duplicates from recently played
  let uniqueUris = [];
  let uniqueRpTracks = [];
  rpTracks.items.forEach((item, i) => {
    if (!uniqueUris.includes(item.track.uri)) {
      uniqueRpTracks.push(item);
      uniqueUris.push(item.track.uri);
    }
  });
  let canvasResponse = await getCanvases(uniqueRpTracks, await canvasToken);
  if (canvasResponse.canvasesList) {
    // build canvas map
    let canvasMap = new Map();
    for (const track of canvasResponse.canvasesList) {
      // have seen a .jpg canvas so log & only save .mp4 format for now
      if (!track.canvasUrl.endsWith('.mp4'))
        console.log('Canvas is not .mp4:', track.canvasUrl);
      if (track.trackUri && track.canvasUrl && track.canvasUrl.endsWith('.mp4')) {
        canvasMap.set(track.trackUri, track.canvasUrl);
      }
    }
    // canvasResponse is in random order so sort by recently played order
    for (const track of uniqueRpTracks) {
      if (canvasMap.has(track.track.uri)) {
        canvases.push({
          'uri': track.track.uri,
          'name': track.track.name,
          'previewUrl': track.track.preview_url,
          'canvasUrl': canvasMap.get(track.track.uri),
        });
      }
    }
  }
  res.send({canvases});
}

function getCanvasToken() {
  const CANVAS_TOKEN_URL = 'https://open.spotify.com/get_access_token?reason=transport&productType=web_player';
  return axios.get(CANVAS_TOKEN_URL)
    .then(response => {
      if (response.statusText !== 'OK') {
        console.log(`ERROR ${CANVAS_TOKEN_URL}: ${response.status} ${response.statusText}`);
        if (response.data.error) {
          console.log(response.data.error);
        }
      } else {
        return response.data.accessToken;
      }
    })
    .catch(error => console.log(`ERROR ${CANVAS_TOKEN_URL}: ${error}`));
}

function getPersonalToken() {
  const PERSONAL_TOKEN_URL = 'https://accounts.spotify.com/api/token';
  const personalTokenForm = {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
  }
  const personalTokenOpts = {
    headers: {
      'content-type': 'application/x-www-form-urlencoded',
      'authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
  }
  return axios.post(PERSONAL_TOKEN_URL, querystring.stringify(personalTokenForm), personalTokenOpts)
    .then(response => {
      if (response.statusText !== 'OK') {
        console.log(`ERROR ${PERSONAL_TOKEN_URL}: ${response.status} ${response.statusText}`);
        if (response.data.error) {
          console.log(response.data.error);
        }
      } else {
        return response.data.access_token;
      }
    })
    .catch(error => console.log(`ERROR ${PERSONAL_TOKEN_URL}: ${error}`));
}

function getRecentlyPlayed(token) {
  const RECENTLY_PLAYED_URL = 'https://api.spotify.com/v1/me/player/recently-played?limit=50';
  const recentlyPlayedOpts = {
    headers: {
      Authorization: `Bearer ${token}`,
    }
  }
  return axios.get(RECENTLY_PLAYED_URL, recentlyPlayedOpts)
    .then(response => {
      if (response.statusText !== 'OK') {
        console.log(`ERROR ${RECENTLY_PLAYED_URL}: ${response.status} ${response.statusText}`);
        if (response.data.error) {
          console.log(response.data.error);
        }
      } else {
        return response.data;
      }
    })
    .catch(error => console.log(`ERROR ${RECENTLY_PLAYED_URL}: ${error}`));
}