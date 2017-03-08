import React from 'react';
import classNames from 'classnames';

import UIComponent from '../UIComponent';
import { getControlComponent } from '../../util/controls';

export default class ControlsPanel extends UIComponent {
    constructor(props, context) {
        super(props, context);
        
        this.state = {
            controls: [],
            activeIndex: 0
        };

        this.nodes = {};

        this.app = context.app;
    }

    componentWillMount() {
        this.updateControls();
    }

    updateControls(callback) {
        let controls = [];

        this.app.stage.getScenes().reverse().forEach(scene => {
            controls.push(scene);
            scene.getEffects().reverse().forEach(effect => {
                controls.push(effect);
            });
            scene.getDisplays().reverse().forEach(display => {
                controls.push(display);
            });
        });

        this.setState({ controls: controls }, callback);
    }

    updateControl(layer) {
        let id = layer.id,
            control = this.refs[id];

        if (control) {
            control.setState(layer.options);
        }
    }

    focusControl(layer, index) {
        let id = layer.id,
            node = this.nodes[id];

        if (node) {
            this.refs.controls.scrollTop = node.offsetTop;
            this.setState({ activeIndex: index });
        }
    }

    render() {
        let controls = this.state.controls.map((display, index, arr) => {
            let id = display.id,
                Component = getControlComponent(display),
                classes = {
                    'control-active': index === this.state.activeIndex,
                    'control-last': index === arr.length - 1
                };

            return (
                <div
                    key={id}
                    ref={el => this.nodes[id] = el}>
                    <Component
                        display={display}
                        className={classNames(classes)}
                    />
                </div>
            );
        });

        return (
            <div className="controls-panel" ref="controls">
                <div className="controls">
                    {controls}
                </div>
            </div>
        );
    }
}

ControlsPanel.contextTypes = {
    app: React.PropTypes.object
};