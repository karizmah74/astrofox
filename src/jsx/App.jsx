var App = React.createClass({
    getInitialState: function() {
        return {
            filename: ''
        };
    },

    componentWillMount: function() {
        var app = this.app = new AstroFox.Application();
        app.addDisplay(new app.FX.TextDisplay());
        app.addDisplay(new app.FX.BarDisplay());
        app.addDisplay(new app.FX.ImageDisplay());
    },

    componentDidMount: function() {
        this.fileForm = React.findDOMNode(this.refs.form);
        this.fileInput = React.findDOMNode(this.refs.file);
        this.saveInput = React.findDOMNode(this.refs.save);
        this.openAction = null;
        this.saveAction = null;

        this.saveInput.setAttribute('nwsaveas', '');
    },

    componentDidUpdate: function() {

    },

    handleClick: function(e) {
        this.refs.menu.setActiveIndex(-1);
    },

    handleDragDrop: function(e) {
        e.stopPropagation();
        e.preventDefault();
    },

    handleMouseDown: function(e) {
        this.app.emit('mousedown');
    },

    handleMouseUp: function(e) {
        this.app.emit('mouseup');
    },

    handlePlayerProgressChange: function() {
        this.refs.waveform.forceUpdate();
    },

    handleWaveformProgressChange: function() {
        this.refs.player.forceUpdate();
    },

    handleFileOpen: function(e) {
        e.preventDefault();

        var files = e.target.files;

        if (files.length > 0) {
            this.openAction(files[0].path);
            this.fileForm.reset();
        }
    },

    handleFileSave: function(e) {
        e.preventDefault();

        this.saveAction(this.saveInput.value);
        this.fileForm.reset();
    },

    handleMenuAction: function(action, checked) {
        switch (action) {
            case 'File/New Project':
                break;

            case 'File/Open Project':
                this.openAction = function(file) {
                    this.app.loadProject(file);
                }.bind(this);

                this.fileInput.click();
                break;

            case 'File/Save Project':
                this.saveAction = function(file) {
                    this.app.saveProject(file);
                }.bind(this);

                this.saveInput.setAttribute('nwsaveas', 'project.afx');
                this.saveInput.click();
                break;

            case 'File/Import Audio':
                this.openAction = function(file) {
                    this.loadAudioFile(file);
                }.bind(this);

                this.fileInput.click();
                break;

            case 'File/Save Image':
                this.saveAction = function(file) {
                    this.app.saveImage(file);
                }.bind(this);

                this.saveInput.setAttribute('nwsaveas', 'image.png');
                this.saveInput.click();
                break;

            case 'File/Save Video':
                this.saveAction = function(file) {
                    this.app.saveVideo(file);
                }.bind(this);

                this.saveInput.setAttribute('nwsaveas', 'video.mp4');
                this.saveInput.click();
                break;

            case 'Edit/Settings':
                this.refs.modal.show(<div>settings!</div>);
                break;

            case 'View/Control Dock':
                this.refs.menu.setCheckState(action, !checked);
                break;

            case 'View/Show FPS':
                this.app.showFPS(!checked);
                this.refs.menu.setCheckState(action, !checked);
                break;

            case 'Help/About':
                this.refs.modal.show(<div>oh hai!</div>);
                break;
        }
    },

    loadAudioFile: function(file) {
        var scene = this.refs.scene;

        scene.isLoading(true);

        this.app.loadAudioFile(file, function(error, data) {
            if (error) {
                scene.isLoading(false);
                throw error;
            }

            this.app.loadAudioData(
                data,
                function(error) {
                    if (error) {
                        scene.isLoading(false);
                        throw error;
                    }

                    this.setState({ filename: file.name }, function() {
                        scene.isLoading(false);
                    });
                }.bind(this)
            );
        }.bind(this));
    },

    render: function() {
        return (
            <div
                id="container"
                onClick={this.handleClick}
                onDrop={this.handleDragDrop}
                onDragOver={this.handleDragDrop}
                onMouseDown={this.handleMouseDown}
                onMouseUp={this.handleMouseUp}>
                <Header />
                <MenuBar
                    ref="menu"
                    app={this.app}
                    onMenuAction={this.handleMenuAction}
                />
                <Body>
                    <ModalWindow ref="modal" width={400} height={300} />
                    <MainView>
                        <Scene
                            ref="scene"
                            app={this.app}
                            onAudioFileLoaded={this.loadAudioFile}
                        />
                        <Waveform
                            ref="waveform"
                            app={this.app}
                            onProgressChange={this.handleWaveformProgressChange}
                        />
                        <Player
                            ref="player"
                            app={this.app}
                            onProgressChange={this.handlePlayerProgressChange}
                        />
                    </MainView>
                    <ControlDock
                        ref="dock"
                        app={this.app}
                    />
                </Body>
                <Footer
                    app={this.app}
                    filename={this.state.filename}
                />
                <form ref="form" className="off-screen">
                    <input
                        ref="file"
                        type="file"
                        onChange={this.handleFileOpen}
                    />
                    <input
                        ref="save"
                        type="file"
                        onChange={this.handleFileSave}
                    />
                </form>
            </div>
        );
    }
});