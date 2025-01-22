import {
  type BufferGeometry,
  type Group,
  Material,
  type Mesh,
  Object3D,
  type Scene,
  Texture,
  type Uniform
} from "three/webgpu";

type SingleResource =
  | Object3D
  | Scene
  | Uniform
  | Group
  | Material
  | Texture
  | Mesh
  | BufferGeometry;

type Resource = SingleResource | SingleResource[];

export class ResourceTracker {
  resources = new Set<Resource>();

  track(resource?: Resource) {
    if (!resource) {
      return;
    }

    // Handle children and when material is an array of materials or
    // uniform is array of textures.
    if (Array.isArray(resource)) {
      for (const item of resource) {
        this.track(item);
      }
      return;
    }

    if ("dispose" in resource || resource instanceof Object3D) {
      this.resources.add(resource);
    }

    if (resource instanceof Object3D) {
      "geometry" in resource && this.track(resource.geometry);
      "material" in resource && this.track(resource.material);
      this.track(resource.children);
    } else if (resource instanceof Material) {
      // We have to check if there are any textures on the material.
      for (const value of Object.values(resource)) {
        if (value instanceof Texture) {
          this.track(value);
        }
      }
    }
  }

  dispose() {
    for (const resource of this.resources) {
      if (resource instanceof Object3D) {
        if (resource.parent) {
          resource.parent.remove(resource);
        }
      }

      if ("dispose" in resource) {
        resource.dispose();
      }
    }

    this.resources.clear();
  }
}
