# wsfmp4.js

[English](https://github.com/yumexupanic/wsfmp4.js) | [简体中文](https://github.com/yumexupanic/wsfmp4.js/blob/main/README_zh.md)

wsfmp4.js is a JavaScript library aimed at playing fmp4 video segments in browsers that support Media Source Extensions (MSE). This library utilizes WebSocket technology to achieve real-time transmission of fmp4 segment data and dynamically adds these segments to the media stream for playback through MSE.

![wsfmp4](https://imgur.cloud/wsfmp4/wsfmp4.jpg)

DEMO: <https://wsfmp4-js.pages.dev>
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
  url: "ws://127.0.0.1:6060/stream",
  debug: true,
  live: true,
  retry: true,
  liveMaxLatency: 8,
  cacheMax: 4,
});
```

### Parameter

- debug Enable debug mode, will output detailed log default false
- retry Enable retry mode by default false (recommended for live broadcast)
- live Enable live mode default false (recommended to enable live)
- liveMaxLatency The maximum latency of the live broadcast, after exceeding it, it will refresh to the latest frame automatically Unit second Default 0 (recommended configuration for live broadcast)
- cacheMax Maximum length of cache, buffer will be cleaned up automatically in seconds Default 8

For live streaming, it is recommended to turn on the configuration related to live streaming, which can effectively control the latency. Live streaming latency usually requires the cooperation of the server and the client, and the client mainly handles the content refresh of the cache and the management of the buffer. The client mainly handles the cache content refresh and buffer management. After the live state is turned on, some optimizations will be performed by default. In addition, the configuration of liveMaxLatency is more important, set too small video will frequently wait, too large delay is high. Specific parameters need to be based on how often the server side encapsulates a packet of data related, there is no universal value.

In live mode, it is recommended to enable the retry function, the default disconnect 3s after the automatic reconnection

### Fucntions

- destroy: Destroys the component.

## Video Control

Video is controlled through HTML video element HTMLVideoElement methods, events and optional UI controls (video controls).

# License

wsfmp4.js is released under Apache 2.0 License
