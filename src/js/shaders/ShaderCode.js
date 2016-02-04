var glslify = require('glslify');

var ShaderCode = {
    vertex: {
        Basic: glslify('../../glsl/vertex/Basic.glsl'),
        Normal: glslify('../../glsl/vertex/Normal.glsl'),
        Position: glslify('../../glsl/vertex/Position.glsl')
    },
    fragment: {
        BarrelBlur: glslify('../../glsl/fragment/BarrelBlur.glsl'),
        Blend: glslify('../../glsl/fragment/Blend.glsl'),
        BoxBlur: glslify('../../glsl/fragment/BoxBlur.glsl'),
        CircularBlur: glslify('../../glsl/fragment/CircularBlur.glsl'),
        ColorShift: glslify('../../glsl/fragment/ColorShift.glsl'),
        Copy: glslify('../../glsl/fragment/Copy.glsl'),
        DotScreen: glslify('../../glsl/fragment/DotScreen.glsl'),
        GaussianBlur: glslify('../../glsl/fragment/GaussianBlur.glsl'),
        Glow: glslify('../../glsl/fragment/Glow.glsl'),
        Grid: glslify('../../glsl/fragment/Grid.glsl'),
        Halftone: glslify('../../glsl/fragment/Halftone.glsl'),
        Hatch: glslify('../../glsl/fragment/Hatch.glsl'),
        Hexagon: glslify('../../glsl/fragment/Hexagon.glsl'),
        Luminance: glslify('../../glsl/fragment/Luminance.glsl'),
        LED: glslify('../../glsl/fragment/LED.glsl'),
        Mirror: glslify('../../glsl/fragment/Mirror.glsl'),
        Pixelate: glslify('../../glsl/fragment/Pixelate.glsl'),
        RGBShift: glslify('../../glsl/fragment/RGBShift.glsl'),
        ZoomBlur: glslify('../../glsl/fragment/ZoomBlur.glsl')
    }
};

module.exports = ShaderCode;