const express = require('express');
const axios = require('axios');
const getCanvases = require('./src/_canvasApi.js');

const app = express();
const port = 3000

app.listen(port, function () {
    console.log("listening on port ", port)
    if (port == 3000) { console.log('running on loca http://localhost:3000') }
});

app.get('/spotify', async function (req, res) {
    let id = req.query.id
    let canvasToken = getCanvasToken();
    let canvasResponse = await getCanvases(id, await canvasToken);

    res.json({ data: canvasResponse });

});

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
