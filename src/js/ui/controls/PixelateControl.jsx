import React from 'react';

import UIComponent from '../UIComponent';
import NumberInput from '../inputs/NumberInput.jsx';
import RangeInput from '../inputs/RangeInput.jsx';
import SelectInput from '../inputs/SelectInput.jsx';
import { Control, Row } from './Control.jsx';

const types = [
    'Square',
    'Hexagon'
];

const MIN_PIXEL_SIZE = 2;
const MAX_PIXEL_SIZE = 240;

export default class PixelateControl extends UIComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
        this.shouldUpdate = false;
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
            <Control label="PIXELATE" className={this.props.className}>
                <Row label="Type">
                    <SelectInput
                        name="type"
                        width={140}
                        items={types}
                        value={this.state.type}
                        onChange={this.onChange}
                    />
                </Row>
                <Row label="Size">
                    <NumberInput
                        name="size"
                        width={40}
                        value={this.state.size}
                        min={MIN_PIXEL_SIZE}
                        max={MAX_PIXEL_SIZE}
                        onChange={this.onChange}
                    />
                    <div className="input flex">
                        <RangeInput
                            name="size"
                            min={MIN_PIXEL_SIZE}
                            max={MAX_PIXEL_SIZE}
                            value={this.state.size}
                            onChange={this.onChange}
                        />
                    </div>
                </Row>
            </Control>
        );
    }
}