'use strict';

var _ = require('lodash');
var Immutable = require('immutable');

var Class = require('core/Class.js');
var EventEmitter = require('core/EventEmitter.js');
var Timer = require('core/Timer.js');
var Player = require('audio/Player.js');
var BufferedSound = require('audio/BufferedSound.js');
var SpectrumAnalyzer = require('audio/SpectrumAnalyzer.js');
var Stage = require('display/Stage.js');
var Scene = require('display/Scene.js');
var Display = require('display/Display.js');
var DisplayLibrary = require('display/DisplayLibrary.js');
var EffectsLibrary = require('effects/EffectsLibrary.js');
var IO = require('IO.js');

var VERSION = '1.0';

var defaults = {
    fps: 29.97,
    canvasWidth: 854,
    canvasHeight: 480,
    useCompression: false
};

var Application = function() {
    this.requestId = null;
    this.data = null;

    this.audioContext = new window.AudioContext();
    this.player = new Player(this.audioContext);
    this.sound = new BufferedSound(this.audioContext);
    this.stage = new Stage();
    this.timer = new Timer();
    this.options = _.assign({}, defaults);
    this.spectrum = new SpectrumAnalyzer(this.audioContext);

    this.player.on('play', this.updateAnalyzer.bind(this));
    this.player.on('stop', this.updateAnalyzer.bind(this));
};

Class.extend(Application, EventEmitter, {
    loadAudioFile: function(file) {
        return new Promise(function(resolve, reject) {
            var buffer,
                reader = new FileReader(),
                player = this.player,
                timer = this.timer;

            player.stop('audio');

            reader.onload = function(e) {
                // DEBUG
                console.log('file loaded', timer.get('file_load'));
                resolve(e.target.result);
            };

            reader.onerror = function(e) {
                reject(file.error);
            }.bind(this);

            timer.set('file_load');

            if (typeof file === 'string') {
                buffer = IO.fs.readFileSync(file);
                file = new Blob([new Uint8Array(buffer).buffer]);
            }

            reader.readAsArrayBuffer(file);
        }.bind(this));
    },

    loadAudioData: function(data) {
        return new Promise(function(resolve, reject) {
            var player = this.player,
                spectrum = this.spectrum,
                timer = this.timer,
                sound = new BufferedSound(this.audioContext);

            sound.on('load', function() {
                // DEBUG
                console.log('sound loaded', timer.get('sound_load'));

                player.load('audio', sound, function() {
                    sound.addNode(spectrum.analyzer);
                });

                player.play('audio');

                resolve();
            }, this);

            sound.on('error', function(error) {
                reject(error);
            });

            timer.set('sound_load');
            sound.load(data);
        }.bind(this));
    },

    startRender: function() {
        if (!this.requestId) {
            this.render();
        }
    },

    stopRender: function() {
        if (this.requestId) {
            cancelAnimationFrame(this.requestId);
            this.requestId = null;
        }
    },

    getFrameData: function() {
        return {
            delta: 0,
            fft: this.spectrum.getFrequencyData(),
            td: this.spectrum.getTimeData(),
            playing: this.player.isPlaying()
        };
    },

    render: function(timestamp) {
        var now = performance.now(),
            id = window.requestAnimationFrame(this.render.bind(this, now)),
            data = this.getFrameData();

        data.delta = now - timestamp;

        this.stage.renderFrame(data);

        this.emit('render', data);

        this.requestId = id;
        this.data = data;
    },

    saveImage: function(filename) {
        var stage = this.stage,
            data = this.getFrameData();

        stage.renderFrame(data, function(){
            stage.getImage(function(buffer) {
                IO.fs.writeFile(filename, buffer, function(err) {
                    if (err) {
                        this.emit('error', new Error(err));
                    }

                    // DEBUG
                    console.log(filename + ' saved.');
                }.bind(this));
            }.bind(this));
        }.bind(this));
    },

    saveVideo: function(filename) {
        var player = this.player,
            sound = player.getSound('audio');

        if (sound) {
            this.stopRender();
            player.stop('audio');

            this.spectrum.enabled = true;

            this.renderVideo(
                filename,
                29.97,
                2,
                this.startRender.bind(this)
            );
        }
        else {
            this.emit('error', new Error('No audio loaded.'));
        }

        // DEBUG
        console.log(filename + ' saved');
    },

    renderVideo: function(output_file, fps, duration, callback) {
        var started = false,
            frames = duration * fps,
            input_file = new IO.Stream.Transform();

        console.log('rending movie', duration, 'seconds,', fps, 'fps');

        input_file.on('error', function(err) {
            console.error(err);
        });

        this.callback = function(next, buffer) {
            if (next < frames) {
                input_file.push(buffer);
                this.processFrame(next, fps, this.callback);
            }
            else {
                input_file.push(null);
            }
        }.bind(this);

        var ffmpeg = IO.Spawn('./bin/ffmpeg.exe', ['-y', '-f', 'image2pipe', '-vcodec', 'png', '-r', fps, '-i', 'pipe:0', '-vcodec', 'libx264', '-movflags', '+faststart', '-pix_fmt', 'yuv420p', '-f', 'mp4', output_file]);
        input_file.pipe(ffmpeg.stdin);
        //ffmpeg.stdout.pipe(outStream);

        ffmpeg.stderr.on('data', function(data) {
            console.log(data.toString());
            if (!started) {
                this.processFrame(0, fps, this.callback);
                started = true;
            }
        }.bind(this));

        ffmpeg.stderr.on('end', function() {
            console.log('file has been converted succesfully');
            if (callback) callback();
        });

        ffmpeg.stderr.on('exit', function() {
            console.log('child process exited');
        });

        ffmpeg.stderr.on('close', function() {
            console.log('program closed');
        });
    },

    processFrame: function(frame, fps, callback) {
        var data, image,
            player = this.player,
            spectrum = this.spectrum,
            stage = this.stage,
            sound = player.getSound('audio'),
            source = this.source = this.audioContext.createBufferSource();

        source.buffer = sound.buffer;
        source.connect(spectrum.analyzer);

        source.onended = function() {
            data = this.getFrameData();
            data.delta = 1000 / fps;

            stage.renderFrame(data, function() {
                stage.getImage(function(buffer) {
                    image = buffer;
                });
            });

            source.disconnect();

            if (callback) callback(frame + 1, image);
        }.bind(this);

        source.start(0, frame / fps, 1 / fps);
    },

    saveProject: function(filename) {
        var data, sceneData,
            options = this.options;

        sceneData = this.stage.getScenes().map(function(scene) {
            return scene.toJSON();
        });

        data = {
            version: VERSION,
            scenes: sceneData
        };

        if (options.useCompression) {
            IO.zlib.deflate(
                JSON.stringify(data),
                function(err, buf) {
                    IO.fs.writeFileSync(filename, new IO.Buffer(buf));
                }.bind(this)
            );
        }
        else {
            IO.fs.writeFile(filename, JSON.stringify(data));
        }

        // DEBUG
        console.log(filename + ' saved.');
    },

    loadProject: function(filename) {
        var options = this.options;

        var data = IO.fs.readFileSync(filename);

        if (options.useCompression) {
            IO.zlib.inflate(data, function(err, buf) {
                try {
                    this.loadControls(JSON.parse(buf.toString()));
                }
                catch (err) {
                    this.raiseError('Invalid project data.', err);
                }
            }.bind(this));
        }
        else {
            try {
                this.loadControls(JSON.parse(data));
            }
            catch (err) {
                this.raiseError('Invalid project data.', err);
            }
        }
    },

    loadControls: function(data) {
        var controls = _.assign({}, DisplayLibrary, EffectsLibrary);

        if (typeof data === 'object') {
            this.stage.clear();

            data.scenes.forEach(function(item) {
                var scene = new Scene(item.name, item.options);
                this.stage.addScene(scene);

                if (item.displays) {
                    item.displays.forEach(function(display) {
                        scene.addDisplay(new controls[display.name](display.options));
                    }.bind(this));
                }
            }.bind(this));

            this.emit('control_added');
        }
        else {
            this.raiseError('Invalid project data.');
        }
    },

    updateAnalyzer: function() {
        var player = this.player,
            spectrum = this.spectrum,
            sound = player.getSound('audio');

        if (sound) {
            spectrum.enabled = (sound.playing || sound.paused);
        }
    },

    raiseError: function(msg, e) {
        if (e) console.error(e);
        this.emit('error', new Error(msg));
    }
});

function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

function toBuffer(ab) {
    var buffer = new Buffer(ab.byteLength);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        buffer[i] = view[i];
    }
    return buffer;
}

module.exports = new Application;
