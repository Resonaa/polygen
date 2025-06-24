import { PerspectiveCamera, Vector2, Vector3 } from "three/webgpu";

export function project(pos: Vector3, camera: PerspectiveCamera) {
  const vector = pos.clone();
  const dir = new Vector3();
  camera.getWorldDirection(dir);
  vector.applyMatrix4(camera.projectionMatrix);
  console.log(vector);
  return new Vector2(vector.x, vector.z);
}
