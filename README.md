# wsfmp4.js

wsfmp4.js is a JavaScript library aimed at playing fmp4 video segments in browsers that support Media Source Extensions (MSE). This library utilizes WebSocket technology to achieve real-time transmission of fmp4 segment data and dynamically adds these segments to the media stream for playback through MSE.

## How to Use:

```javascript
npm install --save wsfmp4.js
```

```javascript
import WSFMP4 from "wsfmp4";

let media = document.querySelector("#video");

let wsfmp4 = new WSFMP4(media, {
  debug: true,
  url: "ws://example.com",
});
```

## Video Control

Video is controlled through HTML video element HTMLVideoElement methods, events and optional UI controls (video controls).

# License

wsfmp4.js is released under Apache 2.0 License
