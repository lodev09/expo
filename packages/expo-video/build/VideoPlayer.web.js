import { useMemo } from 'react';
import resolveAssetSource from './resolveAssetSource';
export function useVideoPlayer(source, setup) {
    const parsedSource = typeof source === 'string' ? { uri: source } : source;
    return useMemo(() => {
        const player = new VideoPlayerWeb(parsedSource);
        setup?.(player);
        return player;
    }, [JSON.stringify(source)]);
}
export function getSourceUri(source) {
    if (typeof source === 'string') {
        return source;
    }
    if (typeof source === 'number') {
        return resolveAssetSource(source)?.uri ?? null;
    }
    if (typeof source?.assetId === 'number' && !source?.uri) {
        return resolveAssetSource(source.assetId)?.uri ?? null;
    }
    return source?.uri ?? null;
}
export function createVideoPlayer(source) {
    const parsedSource = typeof source === 'string' ? { uri: source } : source;
    return new VideoPlayerWeb(parsedSource);
}
export default class VideoPlayerWeb extends globalThis.expo.SharedObject {
    constructor(source) {
        super();
        this.src = source;
    }
    src = null;
    previousSrc = null;
    _mountedVideos = new Set();
    _audioNodes = new Set();
    playing = false;
    _muted = false;
    _volume = 1;
    _loop = false;
    _playbackRate = 1.0;
    _preservesPitch = true;
    _status = 'idle';
    _error = null;
    _timeUpdateLoop = null;
    _timeUpdateEventInterval = 0;
    audioMixingMode = 'auto'; // Not supported on web. Dummy to match the interface.
    allowsExternalPlayback = false; // Not supported on web. Dummy to match the interface.
    staysActiveInBackground = false; // Not supported on web. Dummy to match the interface.
    showNowPlayingNotification = false; // Not supported on web. Dummy to match the interface.
    currentLiveTimestamp = null; // Not supported on web. Dummy to match the interface.
    currentOffsetFromLive = null; // Not supported on web. Dummy to match the interface.
    targetOffsetFromLive = 0; // Not supported on web. Dummy to match the interface.
    bufferOptions = {}; // Not supported on web. Dummy to match the interface.
    subtitleTrack = null; // Embedded subtitles are not supported by the html web player. Dummy to match the interface.
    availableSubtitleTracks = []; // Embedded subtitles are not supported by the html web player. Dummy to match the interface.
    audioTrack = null; // Not supported on web. Dummy to match the interface.
    availableAudioTracks = []; // Not supported on web. Dummy to match the interface.
    videoTrack = null; // Not supported on web. Dummy to match the interface.
    availableVideoTracks = []; // Not supported on web. Dummy to match the interface.
    isExternalPlaybackActive = false; // Not supported on web. Dummy to match the interface.
    set muted(value) {
        this._mountedVideos.forEach((video) => {
            video.muted = value;
        });
        this._muted = value;
    }
    get muted() {
        return this._muted;
    }
    set playbackRate(value) {
        this._mountedVideos.forEach((video) => {
            video.playbackRate = value;
        });
        this._playbackRate = value;
    }
    get playbackRate() {
        return this._playbackRate;
    }
    get isLive() {
        return [...this._mountedVideos][0]?.duration === Infinity;
    }
    set volume(value) {
        this._mountedVideos.forEach((video) => {
            video.volume = value;
        });
        this._volume = value;
    }
    get volume() {
        return this._volume;
    }
    set loop(value) {
        this._mountedVideos.forEach((video) => {
            video.loop = value;
        });
        this._loop = value;
    }
    get loop() {
        return this._loop;
    }
    get currentTime() {
        // All videos should be synchronized, so we return the position of the first video.
        return [...this._mountedVideos][0]?.currentTime ?? 0;
    }
    set currentTime(value) {
        this._mountedVideos.forEach((video) => {
            video.currentTime = value;
        });
    }
    get duration() {
        // All videos should have the same duration, so we return the duration of the first video.
        return [...this._mountedVideos][0]?.duration ?? 0;
    }
    get preservesPitch() {
        return this._preservesPitch;
    }
    set preservesPitch(value) {
        this._mountedVideos.forEach((video) => {
            video.preservesPitch = value;
        });
        this._preservesPitch = value;
    }
    get timeUpdateEventInterval() {
        return this._timeUpdateEventInterval;
    }
    set timeUpdateEventInterval(value) {
        this._timeUpdateEventInterval = value;
        if (this._timeUpdateLoop) {
            clearInterval(this._timeUpdateLoop);
        }
        if (value > 0) {
            // Emit the first event immediately like on other platforms
            this.emit('timeUpdate', {
                currentTime: this.currentTime,
                currentLiveTimestamp: null,
                currentOffsetFromLive: null,
                bufferedPosition: this.bufferedPosition,
            });
            this._timeUpdateLoop = setInterval(() => {
                this.emit('timeUpdate', {
                    currentTime: this.currentTime,
                    currentLiveTimestamp: null,
                    currentOffsetFromLive: null,
                    bufferedPosition: this.bufferedPosition,
                });
            }, value * 1000);
        }
    }
    get status() {
        return this._status;
    }
    get bufferedPosition() {
        if (this._mountedVideos.size === 0 || this.status === 'error') {
            return -1;
        }
        const buffered = [...this._mountedVideos][0]?.buffered;
        for (let i = 0; i < buffered.length; i++) {
            if (buffered.start(i) <= this.currentTime && buffered.end(i) >= this.currentTime) {
                return buffered.end(i);
            }
        }
        return 0;
    }
    set status(value) {
        if (this._status === value)
            return;
        if (value === 'error' && this._error) {
            this.emit('statusChange', {
                status: value,
                oldStatus: this._status,
                error: this._error,
            });
        }
        else {
            this.emit('statusChange', {
                status: value,
                oldStatus: this._status,
            });
            this._error = null;
        }
        this._status = value;
    }
    mountVideoView(video) {
        // The video will be the first video, it should inherit the properties set in the setup() function
        if (this._mountedVideos.size === 0) {
            video.preservesPitch = this._preservesPitch;
            video.loop = this._loop;
            video.volume = this._volume;
            video.muted = this._muted;
            video.playbackRate = this._playbackRate;
        }
        this._mountedVideos.add(video);
        this._addListeners(video);
        this._synchronizeWithFirstVideo(video);
    }
    unmountVideoView(video) {
        this._mountedVideos.delete(video);
    }
    mountAudioNode(audioContext, zeroGainNode, audioSourceNode) {
        if (!audioContext || !zeroGainNode)
            return;
        this._audioNodes.add(audioSourceNode);
        // First mounted video should be connected to the audio context. All other videos have to be muted.
        if (this._audioNodes.size === 1) {
            audioSourceNode.connect(audioContext.destination);
        }
        else {
            audioSourceNode.connect(zeroGainNode);
        }
    }
    unmountAudioNode(video, audioContext, audioSourceNode) {
        const mountedVideos = [...this._mountedVideos];
        const videoPlayingAudio = mountedVideos[0];
        this._audioNodes.delete(audioSourceNode);
        audioSourceNode.disconnect();
        // If video playing audio has been removed, select a new video to be the audio player by disconnecting it from the mute node.
        if (videoPlayingAudio === video && this._audioNodes.size > 0 && audioContext) {
            const newMainAudioSource = [...this._audioNodes][0];
            newMainAudioSource.disconnect();
            newMainAudioSource.connect(audioContext.destination);
        }
    }
    play() {
        this._mountedVideos.forEach((video) => {
            video.play();
        });
    }
    pause() {
        this._mountedVideos.forEach((video) => {
            video.pause();
        });
    }
    replace(source) {
        this._mountedVideos.forEach((video) => {
            const uri = getSourceUri(source);
            video.pause();
            if (uri) {
                video.setAttribute('src', uri);
                video.load();
                video.play();
            }
            else {
                video.removeAttribute('src');
                video.load();
            }
        });
        // TODO @behenate: this won't work when we add support for playlists
        this.previousSrc = this.src;
        this.src = source;
        this.playing = true;
    }
    // The HTML5 player already offloads loading of the asset onto a different thread so we can keep the same
    // implementation until `replace` is deprecated and removed.
    async replaceAsync(source) {
        return this.replace(source);
    }
    seekBy(seconds) {
        this._mountedVideos.forEach((video) => {
            video.currentTime += seconds;
        });
    }
    replay() {
        this._mountedVideos.forEach((video) => {
            video.currentTime = 0;
            video.play();
        });
        this.playing = true;
    }
    generateThumbnailsAsync(times) {
        throw new Error('Generating video thumbnails is not supported on Web yet');
    }
    _synchronizeWithFirstVideo(video) {
        const firstVideo = [...this._mountedVideos][0];
        if (!firstVideo)
            return;
        if (firstVideo.paused) {
            video.pause();
        }
        else {
            video.play();
        }
        video.currentTime = firstVideo.currentTime;
        video.volume = firstVideo.volume;
        video.muted = firstVideo.muted;
        video.playbackRate = firstVideo.playbackRate;
    }
    /**
     * If there are multiple mounted videos, all of them will emit an event, as they are synchronised.
     * We want to avoid this, so we only emit the event if it came from the first video.
     */
    _emitOnce(eventSource, eventName, ...args) {
        const mountedVideos = [...this._mountedVideos];
        if (mountedVideos[0] === eventSource) {
            this.emit(eventName, ...args);
        }
    }
    _addListeners(video) {
        video.onplay = () => {
            this._emitOnce(video, 'playingChange', {
                isPlaying: true,
                oldIsPlaying: this.playing,
            });
            this.playing = true;
            this._mountedVideos.forEach((mountedVideo) => {
                mountedVideo.play();
            });
        };
        video.onpause = () => {
            this._emitOnce(video, 'playingChange', {
                isPlaying: false,
                oldIsPlaying: this.playing,
            });
            this.playing = false;
            this._mountedVideos.forEach((mountedVideo) => {
                mountedVideo.pause();
            });
        };
        video.onvolumechange = () => {
            this._emitOnce(video, 'volumeChange', { volume: video.volume, oldVolume: this.volume });
            this._emitOnce(video, 'mutedChange', { muted: video.muted, oldMuted: this.muted });
            this.volume = video.volume;
            this.muted = video.muted;
        };
        video.onseeking = () => {
            this._mountedVideos.forEach((mountedVideo) => {
                if (mountedVideo === video || mountedVideo.currentTime === video.currentTime)
                    return;
                mountedVideo.currentTime = video.currentTime;
            });
        };
        video.onseeked = () => {
            this._mountedVideos.forEach((mountedVideo) => {
                if (mountedVideo === video || mountedVideo.currentTime === video.currentTime)
                    return;
                mountedVideo.currentTime = video.currentTime;
            });
        };
        video.onratechange = () => {
            this._emitOnce(video, 'playbackRateChange', {
                playbackRate: video.playbackRate,
                oldPlaybackRate: this.playbackRate,
            });
            this._mountedVideos.forEach((mountedVideo) => {
                if (mountedVideo.playbackRate === video.playbackRate)
                    return;
                this._playbackRate = video.playbackRate;
                mountedVideo.playbackRate = video.playbackRate;
            });
            this._playbackRate = video.playbackRate;
        };
        video.onerror = () => {
            this._error = {
                message: video.error?.message ?? 'Unknown player error',
            };
            this.status = 'error';
        };
        video.oncanplay = () => {
            const allCanPlay = [...this._mountedVideos].reduce((previousValue, video) => {
                return previousValue && video.readyState >= 3;
            }, true);
            if (!allCanPlay)
                return;
            this.status = 'readyToPlay';
        };
        video.onwaiting = () => {
            if (this._status === 'loading')
                return;
            this.status = 'loading';
        };
        video.onended = () => {
            this._emitOnce(video, 'playToEnd');
        };
        video.onloadstart = () => {
            this._emitOnce(video, 'sourceChange', { source: this.src, oldSource: this.previousSrc });
        };
    }
}
//# sourceMappingURL=VideoPlayer.web.js.map