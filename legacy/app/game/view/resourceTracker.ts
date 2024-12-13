import * as THREE from "three";

type SingleResource =
  | THREE.Object3D
  | THREE.Scene
  | THREE.Uniform
  | THREE.Group
  | THREE.Material
  | THREE.Texture
  | THREE.Mesh
  | THREE.BufferGeometry;

type Resource = SingleResource | SingleResource[];

export default class ResourceTracker {
  resources = new Set<Resource>();

  track(resource?: Resource) {
    if (!resource) {
      return;
    }

    // Handle children and when material is an array of materials or
    // uniform is array of textures.
    if (Array.isArray(resource)) {
      resource.forEach(resource => this.track(resource));
      return;
    }

    if ("dispose" in resource || resource instanceof THREE.Object3D) {
      this.resources.add(resource);
    }

    if (resource instanceof THREE.Object3D) {
      "geometry" in resource && this.track(resource.geometry);
      "material" in resource && this.track(resource.material);
      this.track(resource.children);
    } else if (resource instanceof THREE.Material) {
      // We have to check if there are any textures on the material.
      for (const value of Object.values(resource)) {
        if (value instanceof THREE.Texture) {
          this.track(value);
        }
      }
    }
  }

  dispose() {
    for (const resource of this.resources) {
      if (resource instanceof THREE.Object3D) {
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
