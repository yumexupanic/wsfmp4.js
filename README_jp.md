# wsfmp4.js

[English](https://github.com/yumexupanic/wsfmp4.js) | [简体中文](https://github.com/yumexupanic/wsfmp4.js/blob/main/README_zh.md) | [日本語](https://github.com/yumexupanic/wsfmp4.js/blob/main/README_jp.md) 

wsfmp4.jsは、MSE技術を使用して実装され、h264とh265をサポートするウェブソケット転送を使用して、ブラウザでfmp4データの再生をサポートしています。

![wsfmp4](https://imgur.cloud/wsfmp4/wsfmp4.jpg)

DEMO: <https://wsfmp4-js.pages.dev>

## 快速开始

ストリーミングサービス（ストリーミングがある場合は、このステップは省略できます）

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

### パラメータの説明

- debug デバッグモードを有効にする、詳細なログを出力する default false
- retry リトライモードを有効にします。デフォルトはfalseです（ライブ放送を推奨）。
- live ライブモードを有効にします。デフォルトはfalseです（ライブモードを有効にすることを推奨します）。
- liveMaxLatency ライブ放送の最大レイテンシ。これを超えると、自動的に最新フレームにリフレッシュされる 単位秒 デフォルト 0（ライブ放送をオンにすることを推奨）
- cacheMax キャッシュの最大長、自動的にバッファをクリーンアップ 単位秒 デフォルト8

ライブ・ストリーミングでは、ライブ・ストリーミングに関連する設定をオンにすることをお勧めします。 ライブ・ストリーミングの遅延は通常、サーバーとクライアントの協力を必要とし、クライアントはキャッシュされたコンテンツのリフレッシュとバッファの管理を処理します。 ライブ状態がオンになった後、デフォルトでいくつかの最適化が実行されます。 liveMaxLatency設定の1つはより重要であり、小さすぎるビデオが頻繁に待機するように設定され、大きすぎる遅延が高くなります。 具体的には、ストリーミングメディアのスライス時間とキーフレームの設定に応じて、固定値はありません。

例えば、ストリーミングのスライス時間が3秒で、値がt、キーフレームが2秒で、値がiの場合、3秒間のデータには少なくとも1つのキーフレームと1つのPフレームまたはBフレームが含まれている必要があり、理想的には、`i * Math.ceil(t / i)`。この値以下では、負荷のラグが発生し、ここではネットワークの揺らぎも考慮する必要がある。

ライブモードでは、リトライ機能を有効にすることをお勧めします。デフォルトでは、切断後3秒後に自動的に再接続されます。

### Method

- destroy コンポーネントを破棄する。

## ビデオコントロール

MSEインターフェイスを使用して実装されているため、最終的なデータはビデオタグに与えられ、ビデオの制御にはビデオ関連のインターフェイスが直接使用される。

# OpenSource License

Apache 2.0 License
