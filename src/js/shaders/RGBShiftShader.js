const THREE = require('three');
const ShaderCode = require('../lib/ShaderCode');

module.exports = {
	uniforms: {
        tDiffuse: { type: 't', value: null },
        amount: { type: 'f', value: 0.005 },
        angle: { type: 'f', value: 0.0 }
	},

	vertexShader: ShaderCode.vertex.Basic,
	fragmentShader: ShaderCode.fragment.RGBShift
};