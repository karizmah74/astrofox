import { NormalBlending } from 'three';
import ShaderPass from 'graphics/ShaderPass';
import BlendShader from 'shaders/BlendShader';
import blendModes from 'config/blendModes.json';

export default class BlendPass extends ShaderPass {
  static defaultProperties = {
    transparent: true,
    needsSwap: true,
    opacity: 1.0,
    blendMode: 'Normal',
    alpha: 1,
    blending: NormalBlending,
    baseBuffer: true,
  };

  constructor(buffer, properties) {
    super(BlendShader, { ...BlendPass.defaultProperties, ...properties });

    this.buffer = buffer;
  }

  render(renderer, writeBuffer, readBuffer) {
    const { properties } = this;

    this.setUniforms({
      tBase: properties.baseBuffer ? this.buffer : readBuffer.texture,
      tBlend: properties.baseBuffer ? readBuffer.texture : this.buffer,
      opacity: properties.opacity,
      mode: blendModes[properties.blendMode],
      alpha: properties.alpha,
    });

    this.mesh.material = this.material;

    super.render(renderer, writeBuffer, readBuffer);
  }
}
