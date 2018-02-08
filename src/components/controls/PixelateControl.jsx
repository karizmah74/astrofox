import React, { PureComponent } from 'react';
import DisplayControl from 'components/controls/DisplayControl';
import { Control, Option, Label } from 'components/controls/Control';
import {
    NumberInput,
    RangeInput,
    SelectInput,
    ReactorInput,
} from 'lib/inputs';

const renderOptions = [
    'Square',
    'Hexagon'
];

const minPixelSize = 2;
const maxPixelSize = 240;

export class PixelateControl extends PureComponent {
    render() {
        const {
            display,
            active,
            type,
            size,
            onChange
        } = this.props;

        return (
            <Control
                label="PIXELATE"
                active={active}
                display={display}
            >
                <Option>
                    <Label text="Type" />
                    <SelectInput
                        name="type"
                        width={140}
                        items={renderOptions}
                        value={type}
                        onChange={onChange}
                    />
                </Option>
                <Option>
                    <Label text="Size" />
                    <ReactorInput
                        name="size"
                        min={minPixelSize}
                        max={maxPixelSize}
                    >
                        <NumberInput
                            name="size"
                            width={40}
                            value={size}
                            min={minPixelSize}
                            max={maxPixelSize}
                            onChange={onChange}
                        />
                        <RangeInput
                            name="size"
                            min={minPixelSize}
                            max={maxPixelSize}
                            value={size}
                            onChange={onChange}
                        />
                    </ReactorInput>
                </Option>
            </Control>
        );
    }
}

export default DisplayControl(PixelateControl);