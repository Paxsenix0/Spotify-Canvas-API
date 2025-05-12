import axios from 'axios';
import { getToken } from './spotifyAuthService.js';

export async function getCanvases(trackUri) {
  const { CanvasRequest, CanvasResponse } = (await import('../proto/_canvas_pb.cjs')).default;
  
  try {
    const accessToken = await getToken();

    const canvasRequest = new CanvasRequest();
    const track = new CanvasRequest.Track();
    track.setTrackUri(trackUri);
    canvasRequest.addTracks(track);

    const requestBytes = canvasRequest.serializeBinary();

    const response = await axios.post(
      'https://spclient.wg.spotify.com/canvaz-cache/v0/canvases',
      requestBytes,
      {
        responseType: 'arraybuffer',
        headers: {
          'Accept': 'application/protobuf',
          'Content-Type': 'application/x-www-form-urlencoded',
          'Accept-Language': 'en',
          'User-Agent': 'Spotify/9.0.34.593 iOS/18.4 (iPhone15,3)',
          'Accept-Encoding': 'gzip, deflate, br',
          'Authorization': `Bearer ${accessToken}`,
        },
      }
    );

    if (response.status !== 200) {
      console.error(`Canvas fetch failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const parsed = CanvasResponse.deserializeBinary(response.data).toObject();
    return parsed;
  } catch (error) {
    console.error(`Canvas request error:`, error);
    return null;
  }
}
