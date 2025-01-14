import type { Camera } from "three";
import { MOUSE, TOUCH } from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

import type * as Settings from "./settings";

export class MapControls extends OrbitControls {
  constructor(
    object: Camera,
    domElement: HTMLElement,
    settings: Settings.Type["game"]["view"]["controls"]
  ) {
    super(object, domElement);

    this.screenSpacePanning = false; // Pan orthogonal to world-space direction camera.up.
    this.enableDamping = true;
    //this.maxPolarAngle = Math.PI / 2;

    Object.assign(this, settings);

    this.mouseButtons = {
      LEFT: MOUSE.PAN,
      MIDDLE: MOUSE.DOLLY,
      RIGHT: MOUSE.ROTATE
    };

    this.touches = { ONE: TOUCH.PAN, TWO: TOUCH.DOLLY_ROTATE };
  }
}
