import { type Mesh, Object3D } from "three";

export class MetaLayer extends Object3D {
  constructor(text: Mesh) {
    super();
    this.add(text);
  }

  get text() {
    return this.children[0] as Mesh;
  }
}
