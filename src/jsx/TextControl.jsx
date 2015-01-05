var TextControl = React.createClass({
    getInitialState: function() {
        return {
            text: '',
            size: 20,
            font: 'Arial',
            italic: false,
            bold: false,
            x: 100,
            y: 100,
            color: '#FFFFFF'
        };
    },

    componentWillMount: function() {
        this.name = 'text';
        this.context = '2d';
        this.fontOptions = [
            'Arial',
            'Times New Roman',
            'Courier New'
        ];
    },

    componentDidMount: function() {
        console.log('control mounted', this.name);
        this.canvas = this.refs.canvas.getDOMNode();
        this.text = new AstroFox.TextDisplay(this.canvas, this.state);
        this.props.onLoad(this)
    },

    handleChange: function(name, val) {
        var state = {};
        state[name] = val;
        this.setState(state);
        this.setState(state, function() {
            this.text.init(this.state);
            this.text.render();
        });
    },

    renderScene: function(canvas) {
        var context = canvas.getContext('2d');
        context.drawImage(this.canvas, 0, 0);
    },

    render: function() {
        var maxHeight = 480;
        var maxWidth = 854;

        return (
            <div className="control">
                <canvas ref="canvas" className="offScreen" width={maxWidth} height={maxHeight} />
                <div className="header"><span>TEXT</span></div>
                <div className="row">
                    <label>Text</label>
                    <TextInput
                        name="text"
                        size="20"
                        value={this.state.text}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label>Font</label>
                    <SelectInput
                        name="font"
                        size="20"
                        values={this.fontOptions}
                        value={this.state.font}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label>Size</label>
                    <NumberInput
                        name="size"
                        size="3"
                        value={this.state.size}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label>X</label>
                    <NumberInput
                        name="x"
                        size="3"
                        value={this.state.x}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="x"
                            min={0}
                            max={maxWidth}
                            value={this.state.x}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label>Y</label>
                    <NumberInput
                        name="y"
                        size="3"
                        value={this.state.y}
                        onChange={this.handleChange} />
                    <div className="input flex">
                        <RangeInput
                            name="y"
                            min={0}
                            max={maxHeight}
                            value={this.state.y}
                            onChange={this.handleChange} />
                    </div>
                </div>
                <div className="row">
                    <label>Bold</label>
                    <ToggleInput
                        name="bold"
                        value={this.state.bold}
                        onChange={this.handleChange} />
                    <label>Italic</label>
                    <ToggleInput
                        name="italic"
                        value={this.state.italic}
                        onChange={this.handleChange} />
                </div>
                <div className="row">
                    <label>Color</label>
                    <ColorInput
                        name="color"
                        value={this.state.color}
                        onChange={this.handleChange} />
                </div>
            </div>
        );
    }
});