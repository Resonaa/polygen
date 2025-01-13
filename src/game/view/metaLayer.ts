import * as THREE from "three";

export class MetaLayer extends THREE.Object3D {
  constructor(text: THREE.Mesh, image: THREE.Mesh) {
    super();
    this.add(text, image);
  }

  get text() {
    return this.children[0] as THREE.Mesh;
  }

  get image() {
    return this.children[1] as THREE.Mesh;
  }
}