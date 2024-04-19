# wsfmp4.js

[English](https://github.com/yumexupanic/wsfmp4.js) | [简体中文](https://github.com/yumexupanic/wsfmp4.js/blob/main/README_zh.md)


wsfmp4.js  支持在浏览器中使用 websocket 传输的 fmp4 数据进行播放，使用 MSE 技术实现。

![wsfmp4](https://imgur.cloud/wsfmp4/wsfmp4.jpg)


DEMO: <https://wsfmp4-js.pages.dev>
## 快速开始

流媒体服务(如果你有流媒体，可以跳过此步)
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
  live: false,
  liveMaxLatency: 4
  url: "ws://127.0.0.1:6060/stream",
});
```

### 参数说明

- debug 开启调试模式，会输出详细 log 默认 false
- live 开启直播模式 默认 false
- liveMaxLatency 允许的直播最大延迟，默认 0

### 函数

- destroy 销毁组件

## 视频控制

由于使用 MSE 接口实现，最终的数据都会给 video 标签，所以控制视频直接使用 video 相关接口。

# 开源协议

Apache 2.0 License
