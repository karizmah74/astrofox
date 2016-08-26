"use strict";

const spawn = window.require('child_process').spawn;
const Stream = window.require('stream');

const EventEmitter = require('../core/EventEmitter');
const { Logger } = require('../core/Global');

const defaults = {
    fps: 29.97,
    timeStart: 0,
    timeEnd: 0,
    format: 'mp4',
    resolution: 480
};

class VideoRenderer extends EventEmitter {
    constructor(videoFile, audioFile, options) {
        super();
        console.log(options);
        this.options = Object.assign({}, defaults, options);

        this.stream = new Stream.Transform();
        this.videoFile = videoFile;
        this.audioFile = audioFile;
        this.started = false;
        this.completed = false;

        console.log(videoFile, audioFile);
    }

    processFrame(frame, image) {
        let stream = this.stream,
            func = this.func,
            options = this.options;

        if (frame < this.frames) {
            stream.push(image);
            func(frame, options.fps, this.processFrame.bind(this));
        }
        else {
            this.completed = true;
            stream.push(null);
        }
    }

    renderVideo(func, callback) {
        let options = this.options,
            stream = this.stream;

        this.func = func;
        this.started = false;
        this.completed = false;
        this.frames = options.fps * (options.timeEnd - options.timeStart);

        Logger.log('rending movie', this.frames/options.fps, 'seconds /', options.fps, 'fps /', this.frames, 'frames');

        stream.on('error', (err) => {
            Logger.error(err);
        });

        let ffmpeg = spawn(
            './bin/ffmpeg.exe',
            [
                '-y', '-f', 'image2pipe', '-vcodec', 'png', '-r', options.fps,
                '-i', 'pipe:0', '-vcodec', 'libx264', '-movflags', '+faststart',
                '-pix_fmt', 'yuv420p', '-f', 'mp4', '-stats',
                this.videoFile + '.tmp'
            ]
        );

        stream.pipe(ffmpeg.stdin);

        ffmpeg.stderr.on('data', (data) => {
            Logger.log(data.toString());

            if (!this.started) {
                func(0, options.fps, this.processFrame.bind(this));
                this.started = true;
            }
        });

        ffmpeg.stderr.on('end', () => {
            Logger.log('file has been converted succesfully');
            //if (callback) callback();
        });

        ffmpeg.stderr.on('exit', () => {
            Logger.log('child process exited');
        });

        ffmpeg.stderr.on('close', () => {
            Logger.log('program closed');

            if (this.completed) {
                this.copyAudio(this.audioFile);
            }
        });
    }

    copyAudio(audioFile) {
        let ffmpeg = spawn(
            './bin/ffmpeg.exe',
            [
                '-y',
                '-i', this.videoFile + '.tmp',
                '-i', audioFile,
                '-codec', 'copy', '-shortest',
                this.videoFile
            ]
        );

        ffmpeg.stderr.on('data', (data) => {
            Logger.log(data.toString());
        });

        ffmpeg.stderr.on('end', () => {
            Logger.log('audio added succesfully');
        });

        ffmpeg.stderr.on('exit', () => {
            Logger.log('child process exited');
        });

        ffmpeg.stderr.on('close', () => {
            Logger.log('program closed');
        });
    }
}

module.exports = VideoRenderer;