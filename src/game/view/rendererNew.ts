import * as THREE from "three";

import type { Palette } from "~/game/gm/palette";
import type { Face } from "~/game/map";
import { Map } from "~/game/map";

import BaseRendererNew from "./baseRendererNew";

export default class RendererNew extends BaseRendererNew {
  constructor(canvas: HTMLCanvasElement, map: Map, palette: Palette) {
    super(canvas, map, palette);
  }

  getRotationAngle() {
    const segments = Map.Sides[this.map.mode];
    return Math.PI * (1 - (segments - 2) / segments);
  }

  createGeometry(face: Face) {
    let radius = this.settings.view.map.radius;
    const segments = face.dir >= 0 ? 4 : Map.Sides[this.map.mode];

    if (face.dir >= 0) {
      if (this.map.mode === Map.Mode.Hexagon) {
        radius *= Math.sqrt(2) / 2;
      } else if (this.map.mode === Map.Mode.Triangle) {
        radius *= Math.sqrt(6) / 2;
      }
    }

    const geometry = new THREE.CircleGeometry(radius, segments);

    geometry.rotateZ((Math.PI * (segments - 2)) / segments / 2);

    if (
      face.dir < 0 &&
      this.map.mode === Map.Mode.Triangle &&
      (face.pos.x + face.pos.y) % 2 === 1
    ) {
      geometry.rotateZ(Math.PI);
    }

    return geometry;
  }

  placeHelper(helper: THREE.Object3D, face: Face) {
    const { x: i, y: j } = face.pos;

    const pos = new THREE.Vector3();

    if (face.dir >= 0) {
      helper.rotation.set(0, this.getRotationAngle() * face.dir, 0);

      if (
        this.map.mode === Map.Mode.Triangle &&
        (face.pos.x + face.pos.y) % 2 === 1
      ) {
        helper.rotateY(Math.PI);
      }
    } else {
      helper.rotation.set(-Math.PI / 2, 0, Math.PI);
    }

    switch (this.map.mode) {
      case Map.Mode.Hexagon: {
        pos.set(
          1 + 1.5 * (j - 1),
          face.yIndex,
          j % 2 === 0 ? Math.sqrt(3) * i : Math.sqrt(3) * (i - 0.5)
        );
        break;
      }
      case Map.Mode.Square: {
        pos.set(
          Math.sqrt(2) * (j - 0.5),
          face.yIndex * Math.sqrt(2),
          Math.sqrt(2) * (i - 0.5)
        );
        break;
      }
      case Map.Mode.Triangle: {
        pos.set(
          (Math.sqrt(3) / 2) * j,
          face.yIndex * Math.sqrt(3),
          1.5 * (i - 1) + ((i + j) % 2 === 0 ? 1 : 0.5)
        );
        break;
      }
    }

    helper.position.copy(pos.multiplyScalar(this.settings.view.map.radius));
  }

  placeContainer(container: THREE.Object3D, face: Face) {
    const pos = new THREE.Vector3();

    switch (this.map.mode) {
      case Map.Mode.Hexagon: {
        pos.setZ(face.dir >= 0 ? Math.sqrt(3) / 2 : 0.5);
        break;
      }
      case Map.Mode.Square: {
        pos.setZ(Math.sqrt(2) / 2);
        break;
      }
      case Map.Mode.Triangle: {
        pos.setZ(face.dir >= 0 ? 0.5 : Math.sqrt(3) / 2);
        break;
      }
    }

    container.position.copy(pos.multiplyScalar(this.settings.view.map.radius));
  }

  getMaxTextWidth(face: Face) {
    let width = 0;

    switch (this.map.mode) {
      case Map.Mode.Hexagon: {
        width = face.dir >= 0 ? 1 : 1.8;
        break;
      }
      case Map.Mode.Square: {
        width = face.dir >= 0 ? Math.sqrt(2) : 1.4;
        break;
      }
      case Map.Mode.Triangle: {
        width = face.dir >= 0 ? Math.sqrt(3) : 0.86;
        break;
      }
    }
    return width * this.settings.view.map.radius;
  }
}
