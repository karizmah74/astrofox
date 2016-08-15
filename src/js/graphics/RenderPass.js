'use strict';

const ComposerPass = require('../graphics/ComposerPass.js');

const defaults = {
    forceClear: true,
    overrideMaterial: null,
    setClearColor: null,
    setClearAlpha: 1.0
};

class RenderPass extends ComposerPass {
    constructor(scene, camera, options) {
        super(Object.assign({}, defaults, options));

        this.scene = scene;
        this.camera = camera;
    }

    render(renderer, writeBuffer, readBuffer) {
        let scene = this.scene,
            camera = this.camera,
            options = this.options;

        scene.overrideMaterial = options.overrideMaterial;

        super.render(renderer, scene, camera, readBuffer);

        scene.overrideMaterial = null;
    }
}

module.exports = RenderPass;