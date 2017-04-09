import { Vector2 } from 'three';
import glsl from '../lib/glsl';

export default {
    uniforms: {
        tDiffuse: { type: 't', value: null },
        resolution: { type: 'v2', value: new Vector2(1, 1) }
    },

    vertexShader: glsl.vertex.Basic,
    fragmentShader: glsl.fragment.FXAA
};