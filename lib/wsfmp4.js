import MP4Box from 'mp4box'

class WSFMP4 {
    constructor(media, options) {
        this.options = Object.assign({}, {
            debug: false,
            live: false,
            url: '',
            duration: 0,
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
            this._cache();
        });
    }

    _cache() {
        if (!this.sourceBuffer || this.sourceBuffer.updating) {
            return;
        }
        if (this.frameQueue.length > 1) {
            let byte_length = 0;
            for (const qnode of this.frameQueue) {
                byte_length += qnode.byteLength;
            }
            let mp4buf = new Uint8Array(byte_length);
            let offset = 0;
            for (const qnode of this.frameQueue) {
                let frame = new Uint8Array(qnode);
                mp4buf.set(frame, offset);
                offset += qnode.byteLength;
            }
            this.sourceBuffer.appendBuffer(mp4buf);
            this.frameQueue.splice(0, this.frameQueue.length);
        } else {
            this.sourceBuffer.appendBuffer(this.frameQueue.shift());
        }
    }

    destroy() {
        if (this.ws) {
            this.ws.close(1000)
            this.ws = null
        }
    }
}

export default WSFMP4