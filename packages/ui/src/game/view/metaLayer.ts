import { type Mesh, Object3D } from "three/webgpu";

export class MetaLayer extends Object3D {
  constructor(
    text: Mesh,
    public isTop: boolean
  ) {
    super();
    this.add(text);
  }

  get text() {
    return this.children[0] as Mesh;
  }
}
