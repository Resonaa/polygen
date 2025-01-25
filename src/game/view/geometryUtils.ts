import {
  BufferAttribute,
  CircleGeometry,
  type Color,
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  type Quaternion,
  type Vector3
} from "three/webgpu";

import { mergeGeometries as mergeGeometriesLib } from "three/addons/utils/BufferGeometryUtils.js";

const material = new MeshBasicMaterial({
  vertexColors: true,
  side: DoubleSide
});

let geometries: CircleGeometry[] = [];

let startingIndex: number[] = [];

let nowIndex = 0;

export function addGeometry(
  radius: number,
  sides: number,
  position: Vector3,
  quaternion: Quaternion
) {
  const geometry = new CircleGeometry(radius, sides);

  geometry.rotateZ((Math.PI * (sides - 2)) / sides / 2);
  geometry.applyQuaternion(quaternion);
  geometry.translate(...position.toArray());

  const vertexCount = geometry.getAttribute("position").count;
  geometries.push(geometry);
  startingIndex.push(nowIndex);
  nowIndex += vertexCount * 3;
}

export function mergeGeometries() {
  startingIndex.push(nowIndex);

  const mergedGeometry = mergeGeometriesLib(geometries, false);
  const colors = new Float32Array(startingIndex[startingIndex.length - 1] * 3);
  mergedGeometry.setAttribute("color", new BufferAttribute(colors, 3, false));
  const mesh = new Mesh(mergedGeometry, material);
  mesh.matrixAutoUpdate = false;
  mesh.matrixWorldAutoUpdate = false;

  for (const geometry of geometries) {
    geometry.dispose();
  }

  return mesh;
}

export function resetGeometries() {
  nowIndex = 0;
  geometries = [];
  startingIndex = [];
}

export function updateGeometry(mesh: Mesh, id: number, color: Color) {
  const attribute = mesh.geometry.getAttribute("color");
  const colors = attribute.array;
  const start = startingIndex[id];
  const end = startingIndex[id + 1] - 1;

  const targetColor = color.toArray();

  for (let i = start; i <= end; i++) {
    colors[i] = targetColor[(i - start) % 3];
  }

  attribute.needsUpdate = true;
}
