const axios = require('axios');
const canvas = require('./_canvas_pb.js');

const CANVASES_URL = 'https://spclient.wg.spotify.com/canvaz-cache/v0/canvases';


module.exports = function getCanvases(tracks, accessToken) {
  // build canvas request protobuf
  let canvasRequest = new canvas.CanvasRequest();
  //for (const track of tracks) {
    let spotifyTrack = new canvas.CanvasRequest.Track();
    spotifyTrack.setTrackUri(tracks);
    canvasRequest.addTracks(spotifyTrack);
  //}
  let requestBytes = canvasRequest.serializeBinary();

  const options = {
    responseType: 'arraybuffer',
    headers: {
      'accept': 'application/protobuf',
      'content-type': 'application/x-www-form-urlencoded',
      'accept-language': 'en',
      'user-agent': 'Spotify/8.5.49 iOS/Version 13.3.1 (Build 17D50)',
      'accept-encoding': 'gzip, deflate, br',
      'authorization': `Bearer ${accessToken}`,
    }
  }
  return axios.post(CANVASES_URL, requestBytes, options)
    .then(response => {
      if (response.statusText !== 'OK') {
        console.log(`ERROR ${CANVASES_URL}: ${response.status} ${response.statusText}`);
        if (response.data.error) {
          console.log(response.data.error);
        }
      } else {
        return canvas.CanvasResponse.deserializeBinary(response.data).toObject();
      }
    })
    .catch(error => console.log(`ERROR ${CANVASES_URL}: ${error}`));
}