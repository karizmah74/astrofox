'use strict';

const id3 = require('id3js');
const remote = window.require('electron').remote;
const path = window.require('path');

const { APP_NAME, APP_VERSION, APP_PATH, USER_DATA_PATH, TEMP_PATH } = require('./Common');
const { events, logger } = require('./Global');
const IO = require('./IO');
const EventEmitter = require('./EventEmitter');
const AppUpdater = require('./AppUpdater');
const Player = require('../audio/Player');
const BufferedSound = require('../audio/BufferedSound');
const SpectrumAnalyzer = require('../audio/SpectrumAnalyzer');
const Stage = require('../displays/Stage');
const Scene = require('../displays/Scene');
const Display = require('../displays/Display');
const DisplayLibrary = require('../lib/DisplayLibrary');
const EffectsLibrary = require('../lib/EffectsLibrary');
const VideoRenderer = require('../video/VideoRenderer');

const appConfig = require('../../conf/app.json');
const menuConfig = require('../../conf/menu.json');

const APP_CONFIG_FILE = path.join(USER_DATA_PATH, 'app.config');
const DEFAULT_PROJECT = path.join(APP_PATH, 'projects', 'default.afx');
const FPS_POLL_INTERVAL = 500;
const UPDATE_SERVER_HOST = 'localhost:3333';

class Application extends EventEmitter {
    constructor() {
        super();

        remote.getCurrentWindow().removeAllListeners();
    
        this.audioContext = new window.AudioContext();
        this.player = new Player(this.audioContext);
        this.spectrum = new SpectrumAnalyzer(this.audioContext);
        this.stage = new Stage();
        this.updater = new AppUpdater(UPDATE_SERVER_HOST);

        this.audioFile = '';
        this.projectFile = '';
        this.rendering = false;
        this.bufferSource = null;

        // Frame render data
        this.frameData = {
            id: 0,
            time: 0,
            delta: 0,
            fft: null,
            td: null,
            playing: false
        };

        // Rendering statistics
        this.stats = {
            fps: 0,
            ms: 0,
            time: 0,
            frames: 0,
            stack: new Uint8Array(10)
        };

        // Player events
        this.player.on('play', this.updateAnalyzer, this);
        this.player.on('pause', this.updateAnalyzer, this);
        this.player.on('stop', this.updateAnalyzer, this);

        // Default configuration
        this.config = Object.assign({}, appConfig);

        // Window events
        window.onmousedown = (e) => {
            events.emit('mousedown', e);
        };

        window.onmouseup = (e) => {
            events.emit('mouseup', e);
        };

        // Handle uncaught errors
        window.onerror = (msg, src, line, col, err) => {
            this.raiseError(msg, err);
            return true;
        };
    }

    init() {
        // Load config file
        this.loadConfig();

        // Create temp folder
        IO.createFolder(TEMP_PATH);

        // Create menu for macOS
        if (process.platform === 'darwin') {
            menuConfig.forEach(root => {
                if (root.submenu) {
                    root.submenu.forEach(item => {
                        if (!item.role && item.action) {
                            item.click = this.menuAction;
                        }
                    });
                }
            });

            remote.Menu.setApplicationMenu(
                remote.Menu.buildFromTemplate(menuConfig)
            );
        }
        else {
            remote.Menu.setApplicationMenu(null);
        }

        // Load default project
        this.newProject();
    }

    startRender() {
        if (!this.frameData.id) {
            this.render();
            this.rendering = true;
        }
    }

    stopRender() {
        let id = this.frameData.id;

        if (id) {
            window.cancelAnimationFrame(id);
        }

        this.frameData.id = 0;
        this.rendering = false;
    }

    render() {
        let now = window.performance.now(),
            data = this.getFrameData(),
            id = window.requestAnimationFrame(this.render.bind(this));

        data.delta = now - data.time;
        data.time = now;
        data.id = id;

        this.stage.render(data);

        events.emit('render', data);

        this.updateFPS(now);
    }

    renderFrame(frame, fps, callback) {
        let data, image,
            player = this.player,
            spectrum = this.spectrum,
            stage = this.stage,
            sound = player.getSound('audio'),
            source = this.bufferSource = this.audioContext.createBufferSource();

        source.buffer = sound.buffer;
        source.connect(spectrum.analyzer);

        source.onended = () => {
            data = this.getFrameData(true);
            data.delta = 1000 / fps;

            stage.render(data, () => {
                stage.getImage(buffer => {
                    image = buffer;
                });
            });

            source.disconnect();

            callback(image);
        };

        source.start(0, frame / fps, 1 / fps);
    }

    loadConfig() {
        if (IO.fileExists(APP_CONFIG_FILE)) {
            return IO.readFileCompressed(APP_CONFIG_FILE).then(data => {
                let config = JSON.parse(data);

                logger.log('Config file loaded.', APP_CONFIG_FILE,  config);

                this.config = Object.assign({}, appConfig, config);
            });
        }
        else {
            this.saveConfig(this.config);
        }
    }

    loadAudioFile(file) {
        this.player.stop('audio');

        return IO.readFileAsBlob(file)
            .then(blob => {
                return IO.readAsArrayBuffer(blob);
            })
            .then(data => {
                return this.loadAudioData(data);
            })
            .then(() => {
                this.audioFile = file;
                this.loadAudioTags(file);

                return file;
            })
            .catch(error => {
                this.raiseError('Failed to load audio file.', error);
            });
    }

    loadAudioData(data) {
        return new Promise((resolve, reject) => {
            let player = this.player,
                spectrum = this.spectrum,
                sound = new BufferedSound(this.audioContext);

            logger.timeStart('audio-data-load');

            sound.on('load', () => {
                logger.timeEnd('audio-data-load', 'Audio data loaded.');

                player.load('audio', sound);

                sound.addNode(spectrum.analyzer);

                resolve();
            }, this);

            sound.on('error', error => {
                reject(error);
            });

            sound.load(data);
        });
    }

    loadAudioTags(file) {
        return IO.readFileAsBlob(file).then(data => {
            id3({ file: data, type: id3.OPEN_FILE }, (err, tags) => {
                if (!err) {
                    events.emit('audio-tags', tags);
                }
            });
        });
    }

    loadProject(file) {
        return IO.readFileCompressed(file).then(
            data => {
                this.loadControls(JSON.parse(data));
                this.resetChanges();

                this.projectFile = file;

                events.emit('project-loaded');
            },
            error => {
                if (error.message.indexOf('incorrect header check') > -1) {
                    IO.readFile(file).then(data => {
                        this.loadControls(JSON.parse(data));
                        this.resetChanges();

                        this.projectFile = file;

                        events.emit('project-loaded');
                    })
                    .catch(error => {
                        this.raiseError('Invalid project file.', error);
                    });
                }
                else {
                    throw error;
                }
            }
        )
        .catch(error => {
            this.raiseError('Failed to open project file.', error);
        });
    }

    loadControls(data) {
        let component;

        if (typeof data === 'object') {
            this.stage.clearScenes();

            data.scenes.forEach(item => {
                let scene = new Scene(item.options);
                this.stage.addScene(scene);

                if (item.displays) {
                    item.displays.forEach(display => {
                        component = DisplayLibrary[display.name];
                        if (!component) component = DisplayLibrary[display.name + 'Display'];

                        if (component) {
                            scene.addElement(new component(display.options));
                        }
                        else {
                            logger.warn('Display "%s" not found.', display.name);
                        }
                    });
                }

                if (item.effects) {
                    item.effects.forEach(effect => {
                        component = EffectsLibrary[effect.name];
                        if (!component) component = EffectsLibrary[effect.name + 'Effect'];

                        if (component) {
                            scene.addElement(new component(effect.options));
                        }
                        else {
                            logger.warn('Effect "%s" not found.', effect.name);
                        }
                    });
                }
            });

            if (data.stage) {
                this.stage.update(data.stage.options);
            }
            else {
                this.stage.update(Stage.defaults);
            }
        }
        else {
            this.raiseError('Invalid project data.');
        }
    }

    saveConfig(config, callback) {
        let data = JSON.stringify(config);

        return IO.writeFileCompressed(APP_CONFIG_FILE, data).then(() => {
            logger.log('Config file saved.', APP_CONFIG_FILE, config);

            Object.assign(this.config, config);

            if (callback) callback();
        })
        .catch(error => {
            this.raiseError('Failed to save config file.', error);
        });
    }

    saveImage(filename) {
        let stage = this.stage,
            data = this.getFrameData(true);

        stage.render(data, () => {
            stage.getImage(buffer => {
                IO.writeFile(filename, buffer)
                    .catch(error => {
                        this.raiseError('Failed to save image file.', error);
                    })
                    .then(() => {
                        logger.log('Image saved. (%s)', filename);
                    });
            });
        });
    }

    saveVideo(filename, options, callback) {
        let player = this.player,
            sound = player.getSound('audio');

        if (sound) {
            let renderer = this.renderer = new VideoRenderer(filename, this.audioFile, options);

            // Setup before rendering
            this.stopRender();
            player.stop('audio');

            // Handle events
            renderer.on('ready', () => {
                this.renderFrame(renderer.currentFrame, options.fps, image => {
                    renderer.processFrame(image);
                });
            });

            renderer.on('complete', () => {
                logger.log('Render complete.');

                if (callback) callback();

                this.bufferSource = null;
                player.stop('audio');
                this.startRender();
            });

            // Start render
            renderer.start();
        }
        else {
            this.raiseError('No audio loaded.');
        }
    }

    saveProject(file) {
        let data, sceneData;

        sceneData = this.stage.getScenes().map(scene => {
            return scene.toJSON();
        });

        data = JSON.stringify({
            version: APP_VERSION,
            stage: this.stage.toJSON(),
            scenes: sceneData
        });

        return IO.writeFileCompressed(file, data).then(() => {
            logger.log('Project saved. (%s)', file);

            this.resetChanges();

            this.projectFile = file;
        })
        .catch(error => {
            this.raiseError('Failed to save project file.', error);
        });
    }

    newProject() {
        if (this.stage.hasChanges()) {
            events.emit('unsaved-changes', () => {
                this.loadProject(DEFAULT_PROJECT).then(() => {
                    this.projectFile = '';
                });
            });
        }
        else {
            this.loadProject(DEFAULT_PROJECT).then(() => {
                this.projectFile = '';
            });
        }
    }

    getFrameData(forceUpdate) {
        let data = this.frameData,
            update = !!forceUpdate || this.player.isPlaying();

        data.fft = this.spectrum.getFrequencyData(update);
        data.td = this.spectrum.getTimeData(update);
        data.hasUpdate = update;

        return data;
    }

    updateFPS(now) {
        let stats = this.stats;

        if (!stats.time) {
            stats.time = now;
        }

        stats.frames += 1;

        if (now > stats.time + FPS_POLL_INTERVAL) {
            stats.fps = Math.round((stats.frames * 1000) / (now - stats.time));
            stats.ms = (now - stats.time) / stats.frames;
            stats.time = now;
            stats.frames = 0;
            stats.stack.copyWithin(1, 0);
            stats.stack[0] = stats.fps;

            events.emit('tick', stats);
        }
    }

    updateAnalyzer() {
        let spectrum = this.spectrum,
            sound = this.player.getSound('audio');

        if (sound) {
            if (!sound.paused) {
                spectrum.clearFrequencyData();
                spectrum.clearTimeData();
            }
        }
    }

    menuAction(menuItem, browserWindow, event) {
        events.emit('menu-action', menuItem.action);
    }

    resetChanges() {
        this.stage.resetChanges();
    }

    raiseError(message, error) {
        if (error) {
            logger.error(message + "\n", error);
        }

        events.emit('error', message);
    }

    checkForUpdates() {
        this.updater.checkForUpdates();
    }

    isRendering() {
        return this.rendering;
    }

    hasAudio() {
        return !!this.player.getSound('audio');
    }
}

module.exports = new Application();
