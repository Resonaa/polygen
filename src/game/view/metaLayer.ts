import * as THREE from "three";

export class MetaLayer extends THREE.Object3D {
  constructor(text: THREE.Mesh) {
    super();
    this.add(text);
  }

  get text() {
    return this.children[0] as THREE.Mesh;
  }
}