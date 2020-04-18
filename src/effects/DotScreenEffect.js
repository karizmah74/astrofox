import Effect from 'core/Effect';
import ShaderPass from 'graphics/ShaderPass';
import DotScreenShader from 'shaders/DotScreenShader';
import { deg2rad } from 'utils/math';

export default class DotScreenEffect extends Effect {
  static label = 'Dot Screen';

  static className = 'DotScreenEffect';

  static defaultOptions = {
    angle: 90,
    scale: 1.0,
  };

  constructor(properties) {
    super(DotScreenEffect, properties);
  }

  updatePass() {
    this.pass.setUniforms({
      scale: this.properties.scale,
      angle: deg2rad(this.properties.angle),
    });
  }

  addToScene() {
    this.setPass(new ShaderPass(DotScreenShader));
    this.updatePass();
  }

  removeFromScene() {
    this.pass = null;
  }
}
