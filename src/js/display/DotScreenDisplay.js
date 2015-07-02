'use strict';

var Class = require('core/Class.js');
var ShaderDisplay = require('display/ShaderDisplay.js');
var DotScreenShader = require('shaders/DotScreenShader.js');

var defaults = {
    angle: 90,
    scale: 1.0
};

var id = 0;
var RADIANS = 0.017453292519943295;

var DotScreenDisplay = function(options) {
    ShaderDisplay.call(this, id++, 'DotScreenDisplay', defaults);

    this.shader = DotScreenShader;

    this.update(options);
};

DotScreenDisplay.info = {
    name: 'Dot Screen'
};

Class.extend(DotScreenDisplay, ShaderDisplay, {
    update: function(options) {
        var changed = this._super.update.call(this, options);

        if (options && options.angle !== undefined) {
            this.options.angle = options.angle * RADIANS;
            changed = true;
        }

        this.changed = changed;

        return changed;
    },

    addToScene: function(scene) {
        this.pass = scene.composer.addShaderPass(this.shader);
    },

    removeFromScene: function(scene) {
        scene.composer.removePass(this.pass);
    },

    updateScene: function(scene) {
        if (this.changed) {
            this.pass.setUniforms(this.options);
            this.changed = false;
        }
    }
});

module.exports = DotScreenDisplay;