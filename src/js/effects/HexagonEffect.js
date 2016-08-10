'use strict';

const Effect = require('../effects/Effect.js');
const ShaderPass = require('../graphics/ShaderPass.js');
const HexagonShader = require('../shaders/HexagonShader.js');

class HexagonEffect extends Effect {
    constructor(options) {
        super(HexagonEffect.label, Object.assign({}, HexagonEffect.defaults, options));

        this.initialized = !!options;
    }

    updatePass() {
        this.pass.setUniforms({ scale: options.scale });
    }

    addToScene(scene) {
        this.setPass(new ShaderPass(HexagonShader));
        this.updatePass();
    }

    removeFromScene(scene) {
        this.pass = null;
    }
}

HexagonEffect.label = 'Hexagon';

HexagonEffect.defaults = {
    scale: 10.0
};

module.exports = HexagonEffect;