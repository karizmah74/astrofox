'use strict';

const React = require('react');

const UIComponent = require('../UIComponent');
const { events } = require('../../core/Global');
const CanvasWave = require('../../canvas/CanvasWave');
const WaveParser = require('../../audio/WaveParser');

class Oscilloscope extends UIComponent {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        this.display = new CanvasWave(
            this.props,
            this.refs.canvas
        );

        events.on('render', this.updateCanvas);
    }

    componentWillUnmount() {
        events.off('render', this.updateCanvas);
    }

    shouldComponentUpdate() {
        return false;
    }

    updateCanvas(data) {
        let points = WaveParser.parseTimeData(data.td, 854, 0);

        this.display.render(points);
    }

    render() {
        return (
            <div className="oscilloscope">
                <canvas ref="canvas" width="854" height="100" />
            </div>
        );
    }
}

Oscilloscope.defaultProps = {
    width: 854,
    height: 100,
    color: '#927FFF'
};

module.exports = Oscilloscope;