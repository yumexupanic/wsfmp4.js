# wsfmp4.js

[English](https://github.com/yumexupanic/wsfmp4.js) | [简体中文](https://github.com/yumexupanic/wsfmp4.js/blob/main/README_zh.md)

wsfmp4.js is a JavaScript library aimed at playing fmp4 video segments in browsers that support Media Source Extensions (MSE). This library utilizes WebSocket technology to achieve real-time transmission of fmp4 segment data and dynamically adds these segments to the media stream for playback through MSE.

![wsfmp4](https://imgur.cloud/wsfmp4/wsfmp4.jpg)

## Quick Start

Streaming service (you can skip this step if you have streaming)

```shell
# ws://127.0.0.1:6060/stream
docker run -d -p 6060:6060 wsfmp4
```

```javascript
npm i wsfmp4.js
```

```javascript
import WSFMP4 from "wsfmp4.js";

let media = document.querySelector("#video");

let wsfmp4 = new WSFMP4(media, {
  debug: true,
  url: "ws://127.0.0.1:6060/stream",
});
```

### Parameter

- debug: Enable debug mode, which will output detailed logs. Default is false.
- live: Enable live mode. Default is false.
- liveMaxLatency: Maximum allowed latency for live streaming. Default is 0.

### Fucntions

- destroy: Destroys the component.

## Video Control

Video is controlled through HTML video element HTMLVideoElement methods, events and optional UI controls (video controls).

# License

wsfmp4.js is released under Apache 2.0 License
