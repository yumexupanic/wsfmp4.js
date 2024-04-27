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
                if (video.buffered.length > 0) {
                    let start = this.media.buffered.start(this.media.buffered.length - 1);
                    let end = this.media.buffered.end(this.media.buffered.length - 1);

                    if (this.options.debug) {
                        console.log(`buffer: current => ${current},buffer_start => ${start},buffer_end => ${end}`);
                    }


                    if (this.options.live) {
                        if (end - current > this.options.liveMaxLatency) {
                            this.media.currentTime = end;
                            if (!this.media.paused && this.options.live && this.media.muted) {
                                this.media.play().then(() => { }).catch(error => { })
                            }

                            console.log(`live streaming optimization refresh latency: latency => ${end - current},now => ${this.media.currentTime}`);
                        }
                    } else {
                        if (current < start) {
                            this.media.currentTime = start;
                            if (this.options.debug) {
                                console.log(`reset start playback time: current => ${current},now => ${start}`);
                            }
                        }
                    }
                    if (current - start > this.options.cacheMax * 2) {
                        this.sourceBuffer.remove(0, current - this.options.cacheMax)
                        if (this.options.debug) {
                            console.log(`clearing the played cache: start => ${start},end => ${end},second => ${current - start}`);
                        }
                    }
                }
            }
            this._cache();
        });

        let paused
        document.addEventListener('visibilitychange', () => {
            if (this.sourceBuffer) {
                if (document.hidden) {
                    paused = this.media.paused
                    this.media.pause()
                } else {
                    if (!paused) {
                        if (this.media.buffered.length) {
                            let end = this.media.buffered.end(this.media.buffered.length - 1)
                            this.media.currentTime = end
                        }
                        this.media.play().then(() => { }).catch(error => { })
                    }
                }
            }
        })
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