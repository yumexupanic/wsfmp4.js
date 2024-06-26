# wsfmp4.js

[English](https://github.com/yumexupanic/wsfmp4.js) | [简体中文](https://github.com/yumexupanic/wsfmp4.js/blob/main/README_zh.md) | [日本語](https://github.com/yumexupanic/wsfmp4.js/blob/main/README_jp.md) 

wsfmp4.js 支持在浏览器中使用 websocket 传输的 fmp4 数据进行播放，使用 MSE 技术实现，支持 h264 以及 h265。

![wsfmp4](https://imgur.cloud/wsfmp4/wsfmp4.jpg)

DEMO: <https://wsfmp4-js.pages.dev>

## 快速开始

流媒体服务(如果你有流媒体，可以跳过此步)

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

### 参数说明

- debug 开启调试模式，会输出详细 log 默认 false
- retry 开启重试 默认 false （直播推荐开启）
- live 开启直播模式 默认 false （直播推荐开启）
- liveMaxLatency 直播最大延迟，超过后会自动刷新到最新帧 单位秒 默认 0 （直播推荐开启）
- cacheMax 缓存的最大时长，自动清理 buffer 单位秒 默认 8
- duration 设置视频总时长，单位秒 默认 0（这会切换加载方式为 sequence，而不是 PTS）

对于直播流，推荐开启直播相关的配置，能有效的控制延时，直播延时通常需要服务器和客户端配合，客户端处理缓存的内容刷新以及 buffer 的管理。开启了直播状态后，默认会进行一些优化。其中 liveMaxLatency 的配置比较重要，设置的太小视频会频繁的等待，太大会延迟较高。具体需要根据流媒体的分片时间以及关键帧设置，没有固定值。

举例来说：流媒体分片时间为 3 秒 取值为 t，关键帧为 2 秒 取值为 i，那么这 3 秒数据中，至少包含一个关键帧和一个P帧或者B帧，理想的情况为: i * Math.ceil(t / i) 这里就是 4。低于这个值一定会出现卡顿加载，这里还需要考虑到网络波动的情况。 

直播模式下，推荐开启重试功能，默认断开 3s 后自动重连

### 函数

- destroy 销毁组件

## 视频控制

由于使用 MSE 接口实现，最终的数据都会给 video 标签，所以控制视频直接使用 video 相关接口。

# 开源协议

Apache 2.0 License
