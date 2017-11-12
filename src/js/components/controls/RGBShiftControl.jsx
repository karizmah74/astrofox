import React from 'react';

import UIPureComponent from 'components/UIPureComponent';
import NumberInput from 'components/inputs/NumberInput';
import RangeInput from 'components/inputs/RangeInput';
import { Control, Option } from 'components/controls/Control';

export default class RGBShiftControl extends UIPureComponent {
    constructor(props) {
        super(props);

        this.state = this.props.display.options;
    }

    onChange(name, val) {
        let obj = {},
            display = this.props.display;

        obj[name] = val;

        this.setState(obj, () => {
            display.update(obj);
        });
    }

    render() {
        const { stageWidth } = this.props,
            { offset, angle } = this.state;

        return (
            <Control label="RGB SHIFT" className={this.props.className}>
                <Option label="Offset">
                    <NumberInput
                        name="offset"
                        width={40}
                        value={offset}
                        min={0}
                        max={stageWidth}
                        step={1}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="offset"
                        min={0.0}
                        max={stageWidth}
                        step={1}
                        value={offset}
                        onChange={this.onChange}
                    />
                </Option>
                <Option label="Angle">
                    <NumberInput
                        name="angle"
                        width={40}
                        value={angle}
                        min={0}
                        max={360}
                        onChange={this.onChange}
                    />
                    <RangeInput
                        name="angle"
                        min={0}
                        max={360}
                        value={angle}
                        onChange={this.onChange}
                    />
                </Option>
            </Control>
        );
    }
}