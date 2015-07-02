var THREE = require('three');
var ShaderCode = require('shaders/ShaderCode.js');

var HexagonShader = {
    uniforms: {
        tDiffuse: { type: "t", value: null },
        center: { type: "v2", value: new THREE.Vector2(0.5, 0.5) },
        scale: { type: "f", value: 10.0 },
        tSize: { type: "v2", value: new THREE.Vector2(854, 480) }
    },

    vertexShader: ShaderCode.vertex.basic,
    fragmentShader: ShaderCode.fragment.hexagon
};

module.exports = HexagonShader;