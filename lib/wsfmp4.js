import MP4Box from 'mp4box'

class WSFMP4 {
    constructor(media, options) {
        this.options = Object.assign({}, {
            debug: false,
            url: '',
            duration: 0,

            live: false,
            liveMaxLatency: 0
        }, options);

        this.media = media;
        this.ws = null;
        this.frameQueue = [];
        this.sourceBuffer = null;

        this._setup()
    }

    _setup() {
        this.ws = new WebSocket(this.options.url);
        this.ws.binaryType = 'arraybuffer';

        this.mp4Box = MP4Box.createFile();
        this.mp4Box.onReady = this._demux.bind(this);

        this.ws.onmessage = ({ data }) => {
            if (!this.sourceBuffer) {
                data.fileStart = 0;
                this.mp4Box.appendBuffer(data);
            }
            this.frameQueue.push(data);
            this._cache()
        }
    }

    _demux(info) {
        this.mp4Box.flush();

        if (this.options.debug) {
            console.log(`demux info:`)
            console.table(info)
        }
        if (!info.isFragmented) {
            console.error("not fragmented mp4")
            return;
        }

        let codecs = info.tracks.map(e => e.codec)
        if (this.options.debug) {
            console.log(`sourcebuffer codecs => ${codecs}`)
        }
        let mediasource = new MediaSource()
        this.media.src = URL.createObjectURL(mediasource);

        mediasource.addEventListener('sourceopen', () => {
            this.sourceBuffer = mediasource.addSourceBuffer(`video/mp4; codecs="${codecs.join(', ')}"`);
            if (this.options.duration) {
                mediasource.duration = this.options.duration
            }

            this.sourceBuffer.onupdateend = () => {
                let cacheMax = 24

                let current = this.media.currentTime;
                if (video.buffered.length > 0) {
                    let start = this.media.buffered.start(0);
                    let end = this.media.buffered.end(0);
                    if (this.options.debug) {
                        console.log(`buffer: current => ${current},buffer_start => ${start},buffer_end => ${end}`);
                    }

                    if (current < start) {
                        this.media.currentTime = start;
                        if (this.options.debug) {
                            console.log(`reset start playback time: current => ${current},now => ${start}`);
                        }
                    }

                    if (current - start > cacheMax * 2) {
                        this.sourceBuffer.remove(start, start + cacheMax)
                        if (this.options.debug) {
                            console.log(`clearing the played cache: start => ${start},end => ${end},second => ${current - start}`);
                        }
                    }

                    if (this.options.live && this.options.liveMaxLatency) {
                        if (end - current > this.options.liveMaxLatency) {
                            this.media.currentTime = end;
                            console.log(`live streaming optimization refresh latency: latency => ${end - current},end => ${end}`);
                        }
                    }
                }
            }
            this._cache();
        });
    }

    _cache() {
        if (!this.sourceBuffer || this.sourceBuffer.updating) {
            return;
        }
        if (this.frameQueue.length > 1) {
            let freeBuffer = this.frameQueue.splice(0, this.frameQueue.length)
            let length = freeBuffer.map(e => e.byteLength).reduce((a, b) => a + b, 0)
            let buffer = new Uint8Array(length);
            let offset = 0;
            for (let data of freeBuffer) {
                let frame = new Uint8Array(data);
                buffer.set(frame, offset);
                offset += data.byteLength;
            }
            this.sourceBuffer.appendBuffer(buffer);
        } else {
            this.sourceBuffer.appendBuffer(this.frameQueue.shift());
        }
    }

    destroy() {
        if (this.ws) {
            this.ws.close(1000)
            this.ws = null
            this.sourceBuffer.abort()
        }
    }
}

export default WSFMP4