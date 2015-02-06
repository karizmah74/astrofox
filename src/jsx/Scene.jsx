var Scene = React.createClass({
    getInitialState: function() {
        return { loading: false };
    },

    componentWillMount: function() {

    },

    componentDidMount: function() {
        var app = this.props.app;

        this.canvas = this.refs.canvas.getDOMNode();
        app.loadCanvas(this.canvas);

        // DEBUG
        console.log('scene loaded');

        //this.renderScene();
        app.startRender();
    },

    handleDragOver: function(e){
        e.stopPropagation();
        e.preventDefault();
    },

    handleDrop: function(e){
        e.stopPropagation();
        e.preventDefault();

        var file = e.dataTransfer.files[0];

        this.isLoading(true);

        this.props.app.loadFile(file, function(filename, data) {
            this.props.onFileLoaded(filename, data, function() {
                this.isLoading(false);
            }.bind(this));
        }.bind(this));
    },

    isLoading: function(val) {
        this.setState({ loading: val });
    },

    renderScene: function() {
        requestAnimationFrame(this.renderScene);

        this.props.app.renderScene();
    },

    render: function() {
        return (
            <div id="scene"
                onDrop={this.handleDrop}
                onDragOver={this.handleDragOver}>
                <Loading loading={this.state.loading} />
                <canvas ref="canvas" id="canvas" height="480" width="854"></canvas>
            </div>
        );
    }
});