# Spotify-Canvas-API
Easily get canvas video url from trackid!

> [!WARNING]
> This project is probably against Spotify TOS. Use at your own risks.

### Examples GET

```
https://localhost:3000/spotify?id=spotify:track:3OHfY25tqY28d16oZczHc8
```
### Response:

```json
{
  "data": {
    "canvasesList": [
      {
        "id": "32b57cbf354b453a95eee32bb04d4e42",
        "canvasUrl": "https://canvaz.scdn.co/upload/licensor/5bSw7fRotCnRCcO9br14W5/video/32b57cbf354b453a95eee32bb04d4e42.cnvs.mp4",
        "trackUri": "spotify:track:3OHfY25tqY28d16oZczHc8",
        "artist": {
          "artistUri": "spotify:artist:7tYKF4w9nC0nq9CsPZTHyP",
          "artistName": "SZA",
          "artistImgUrl": "https://i.scdn.co/image/ab6761610000f1780895066d172e1f51f520bc65"
        },
        "otherId": "2c441fceb502eaa25f26bcd5b1ccfc0d",
        "canvasUri": "spotify:canvas:1xGyujDyxbx4eTPD4nKLw6"
      }
    ]
  }
}
```
### Deployment
__Vercel__

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FPaxsenix0%2FSpotify-Canvas-API%2Ftree%2Fmain&project-name=Spotify-Canvas-API&repository-name=Spotify-Canvas-API&redirect-url=https%3A%2F%2Fgithub.com%2FPaxsenix0%2FSpotify-Canvas-API)


### Information
i'm sorry if the code is too weird, because i'm only using Phone (i don't have PC/Laptop) and i'm still beginner:)

### Reference
i'm doing searching about spotify canvas API but i cant find it, so i made it from help this repo: https://github.com/bartleyg/my-spotify-canvas
