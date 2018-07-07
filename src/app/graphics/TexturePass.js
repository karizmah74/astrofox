import {
    NormalBlending,
    MeshBasicMaterial,
    Scene,
    OrthographicCamera,
    PlaneBufferGeometry,
    Mesh,
} from 'three';
import ComposerPass from 'graphics/ComposerPass';

export default class TexturePass extends ComposerPass {
    static defaultOptions = {
        color: 0xffffff,
        opacity: 1.0,
        transparent: true,
        needsSwap: false,
        needsUpdate: true,
        forceClear: false,
        depthTest: false,
        depthWrite: false,
        blending: NormalBlending,
    }

    constructor(texture, options) {
        super({ ...TexturePass.defaultOptions, ...options });

        const {
            color, depthTest, depthWrite, transparent, blending,
        } = this.options;

        this.texture = texture;

        this.material = new MeshBasicMaterial({
            map: texture,
            color,
            depthTest,
            depthWrite,
            transparent,
            blending,
        });

        this.scene = new Scene();
        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.geometry = new PlaneBufferGeometry(2, 2);

        this.mesh = new Mesh(this.geometry, this.material);
        this.mesh.frustumCulled = false;

        this.scene.add(this.mesh);
    }

    render(renderer, writeBuffer, readBuffer) {
        const { scene, camera, texture } = this;
        const { needsUpdate } = this.options;

        texture.needsUpdate = needsUpdate;

        super.render(renderer, scene, camera, readBuffer);
    }
}
