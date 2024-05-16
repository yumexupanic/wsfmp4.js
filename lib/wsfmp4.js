import MP4Box from 'mp4box'

class WSFMP4 {
    constructor(media, options) {
        this.options = Object.assign({}, {
            debug: false,
            retry: false,
            url: '',
            duration: 0,

            cacheMax: 8,
            live: false,
            liveMaxLatency: 0
        }, options);

        this.media = media;
        this.ws = null;
        this.frameQueue = [];
        this.sourceBuffer = null;
        this.bufferOffset = 0;
        this.lastBufferEnd = 0;

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

        this.ws.onclose = (event) => {
            console.error('websocket disconnected:', event.code, event.reason);
            if (this.options.retry) {
                if (event.code != 1000) {
                    let sid = setTimeout(() => {
                        clearTimeout(sid)
                        console.log('try reloading...')
                        this.destroy()
                        this._setup()
                    }, 1000 * 3)
                }
            }
        };

        this.ws.onerror = function (error) {
            console.error('websocket error:', error);
        };

        // this._videoErrorListener = (e) => {
        //     if (this.media.error.message.indexOf('Empty') < 0) {
        //         console.error(`video error message => ${this.media.error.message}`)
        //         console.log('try reloading...')
        //         let sid = setTimeout(() => {
        //             clearTimeout(sid)
        //             this.destroy()
        //             this._setup()
        //         }, 1000 * 3)
        //     }
        // }
        // this.media.addEventListener('error', this._videoErrorListener)

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
        this.codecs = info.mime
        this._mediasource()
    }

    _mediasource() {
        if (this.options.debug) {
            console.debug(`sourcebuffer codecs => ${this.codecs}`)
        }
        if (!MediaSource.isTypeSupported(this.codecs)) {
            console.warn(`unsupported formats => ${this.codecs}`)
            return
        }

        this.mediasource = new MediaSource()
        this.media.preload = "metadata"
        this.media.src = URL.createObjectURL(this.mediasource);

        this.mediasource.addEventListener('sourceopen', () => {
            this.sourceBuffer = this.mediasource.addSourceBuffer(this.codecs);
            if (this.options.duration) {
                mediasource.duration = this.options.duration
            }

            this.sourceBuffer.onupdateend = () => {

                let current = this.media.currentTime;
                if (this.media.buffered.length > 0) {
                    let start = this.media.buffered.start(this.media.buffered.length - 1);
                    let end = this.media.buffered.end(this.media.buffered.length - 1);

                    if (this.options.debug) {
                        console.log(`buffer: current => ${current},buffer_start => ${start},buffer_end => ${end}`);

                        if (this.bufferOffset) {
                            console.log(`length of segment => ${this.bufferOffset}`);
                        }
                    }

                    if (this.lastBufferEnd) {
                        this.bufferOffset = Math.ceil(end - this.lastBufferEnd)
                    }

                    if (!current && start) {
                        this.media.currentTime = start;
                        if (this.options.debug) {
                            console.log(`reset start playback time: current => ${current},now => ${start}`);
                        }
                        return;
                    }

                    if (this.options.live && this.bufferOffset && this.options.liveMaxLatency) {
                        let offsetMaxLatency = this.options.liveMaxLatency;
                        if (offsetMaxLatency <= this.bufferOffset || offsetMaxLatency < this.bufferOffset * 2) {
                            offsetMaxLatency = this.bufferOffset * 2;
                        }
                        if (end - current > offsetMaxLatency) {
                            this.media.currentTime = end - this.bufferOffset
                            console.log(`live refresh latency: current => ${current},end => ${end},latency => ${end - current},now => ${this.media.currentTime}`);
                        }
                    }
                    if (!this.sourceBuffer.updating && current - start > this.options.cacheMax) {
                        this.sourceBuffer.remove(0, current - this.options.cacheMax)
                        if (this.options.debug) {
                            console.log(`clear cache: start => 0,end => ${current - this.options.cacheMax}`);
                        }
                    }
                    this.lastBufferEnd = end;
                }
            }
            this._cache();
        });

        if (this.options.live) {
            document.addEventListener('visibilitychange', () => {
                if (!document.hidden && this.sourceBuffer) {
                    if (this.media.buffered.length) {
                        let end = this.media.buffered.end(this.media.buffered.length - 1)
                        this.media.currentTime = end - this.bufferOffset
                        if (this.options.debug) {
                            console.log(`visibilitychange live refresh latency: now => ${this.media.currentTime}`)
                        }
                    }
                }
            })
        }
    }

    _cache() {
        if (!this.sourceBuffer || this.sourceBuffer.updating || !this.frameQueue.length) {
            return;
        }
        let frame = null
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
            frame = buffer
        } else {
            frame = this.frameQueue.shift()
        }

        if (frame) {
            this.sourceBuffer.appendBuffer(frame);
            if (this.options.debug) {
                console.log(`load buffer: size => ${frame.byteLength}`);
            }
        }
    }
    destroy() {
        if (this.ws) {
            this.ws.close(1000)
            this.ws = null
        }
        this.frameQueue = [];
        this.media.pause();
        this.media.currentTime = 0;
        this.codecs = ""

        if (this.mediasource) {
            try { this.sourceBuffer.abort() } catch (e) { }
            try { this.mediasource.removeSourceBuffer(this.sourceBuffer) } catch (e) { }
            this.sourceBuffer = null
            this.mediasource = null
        }

    }
}

export default WSFMP4