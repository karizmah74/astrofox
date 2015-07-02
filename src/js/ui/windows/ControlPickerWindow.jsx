'use strict';

var React = require('react');
var _ = require('lodash');
var Application = require('core/Application.js');
var Display = require('display/Display.js');
var ShaderDisplay = require('display/ShaderDisplay.js');

var ModalWindow = require('./ModalWindow.jsx');

var ControlPickerWindow = React.createClass({
    render: function() {
        var controls = _.values(this.props.items).map(function(item, index){
            var handleClick = function() {
                var obj = new item();

                /*
                if (obj instanceof ShaderDisplay) {
                    this.props.scene.addEffect(obj);
                    Application.emit('control_added', obj);
                }
                else if (obj instanceof Display) {
                    this.props.scene.addDisplay(obj);
                    Application.emit('control_added', obj);
                }
                */

                this.props.scene.addDisplay(obj);
                Application.emit('control_added', obj);

                Application.emit('hide_modal');
            }.bind(this);

            return (
                <div key={"c" + index} className="item">
                    <div className="image" onClick={handleClick}></div>
                    <div className="name">{item.info.name}</div>
                </div>
            );
        }.bind(this));

        return (
            <ModalWindow title={this.props.title}>
                <div className="control-picker">
                    {controls}
                </div>
            </ModalWindow>
        );
    }
});

module.exports = ControlPickerWindow;