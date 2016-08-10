'use strict';

const React = require('react');
const NumberInput = require('../inputs/NumberInput.jsx');
const RangeInput = require('../inputs/RangeInput.jsx');
const SelectInput = require('../inputs/SelectInput.jsx');
const autoBind = require('../../util/autoBind.js');

const blendModes = [
    'Add',
    'Screen'
];

class BloomControl extends React.Component {
    constructor(props) {
        super(props);
        autoBind(this);

        this.state = Object.assign({}, this.props.display.constructor.defaults);
    }

    componentWillMount() {
        this.shouldUpdate = false;
    }

    componentDidMount() {
        let display = this.props.display;

        if (display.initialized) {
            this.shouldUpdate = true;
            this.setState(display.options);
        }
        else {
            display.update(this.state);
        }
    }

    componentDidUpdate() {
        this.shouldUpdate = false;
    }

    shouldComponentUpdate() {
        return this.shouldUpdate;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.shouldUpdate = true;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        return (
            <div className="control">
                <div className="header">BLOOM</div>
                <div className="row">
                    <span className="label">Blend Mode</span>
                    <SelectInput
                        name="blendMode"
                        size="20"
                        items={blendModes}
                        value={this.state.blendMode}
                        onChange={this.onChange} />
                </div>
                <div className="row">
                    <span className="label">Amount</span>
                    <NumberInput
                        name="amount"
                        size="3"
                        value={this.state.amount}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="amount"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.amount}
                            onChange={this.onChange} />
                    </div>
                </div>
                <div className="row">
                    <span className="label">Threshold</span>
                    <NumberInput
                        name="threshold"
                        size="3"
                        value={this.state.threshold}
                        min={0}
                        max={1.0}
                        step={0.01}
                        onChange={this.onChange} />
                    <div className="input flex">
                        <RangeInput
                            name="threshold"
                            min={0}
                            max={1.0}
                            step={0.01}
                            value={this.state.threshold}
                            onChange={this.onChange} />
                    </div>
                </div>
            </div>
        );
    }
}

module.exports = BloomControl;