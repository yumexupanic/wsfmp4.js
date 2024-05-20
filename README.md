# wsfmp4.js

[English](https://github.com/yumexupanic/wsfmp4.js) | [简体中文](https://github.com/yumexupanic/wsfmp4.js/blob/main/README_zh.md) | [日本語](https://github.com/yumexupanic/wsfmp4.js/blob/main/README_jp.md) 

wsfmp4.js is a JavaScript library aimed at playing fmp4 video segments in browsers that support Media Source Extensions (MSE). This library utilizes WebSocket technology to achieve real-time transmission of fmp4 segment data and dynamically adds these segments to the media stream for playback through MSE.

![wsfmp4](https://imgur.cloud/wsfmp4/wsfmp4.jpg)

DEMO: <https://wsfmp4-js.pages.dev>
## Quick Start

Streaming service (you can skip this step if you have streaming)

```shell
# ws://127.0.0.1:6060/stream
docker run -d -p 6060:6060 yumexupanic/wsfmp4
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
- duration Sets the total duration of the video in seconds Default 0 (this will toggle the loading method to sequence instead of PTS)

For live streaming, it is recommended to turn on the configuration related to live streaming, which can effectively control the latency. Live streaming latency usually requires the cooperation of the server and the client, and the client handles the refresh of the cached content as well as the management of the buffer. After the live state is turned on, some optimizations will be performed by default. One of the liveMaxLatency configuration is more important, set too small video will frequently wait, too large delay is high. Specifically according to the streaming media slice time and key frame settings, there is no fixed value.

For example: the streaming media slice time is 3 seconds, take the value of t, the key frame is 2 seconds, take the value of i, then the 3 seconds of data, including at least one key frame and a P frame or B frame, the ideal situation is: `i * Math.ceil(t / i)` here is 4. Below this value will definitely appear to lag load, and here we also need to take into account the fluctuations of the network.

In live mode, it is recommended to enable the retry function, the default disconnect 3s after the automatic reconnection

### Fucntions

- destroy: Destroys the component.

## Video Control

Video is controlled through HTML video element HTMLVideoElement methods, events and optional UI controls (video controls).

# License

wsfmp4.js is released under Apache 2.0 License
