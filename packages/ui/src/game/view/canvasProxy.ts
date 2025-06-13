import { EventDispatcher } from "three/webgpu";

function noop() {}

export class CanvasProxy extends EventDispatcher<Record<string, Event>> {
  // OrbitControls try to set style.touchAction
  style = {};

  left = 0;
  top = 0;
  width = 0;
  height = 0;

  getRootNode() {
    return {
      addEventListener: noop,
      removeEventListener: noop
    };
  }

  get clientWidth() {
    return this.width;
  }

  get clientHeight() {
    return this.height;
  }

  // OrbitControls call these as of r132. Maybe we should implement them
  setPointerCapture = noop;
  releasePointerCapture = noop;

  getBoundingClientRect() {
    return {
      left: this.left,
      top: this.top,
      width: this.width,
      height: this.height,
      right: this.left + this.width,
      bottom: this.top + this.height
    };
  }

  handleEvent(data: Event) {
    data.preventDefault = noop;
    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }

  focus = noop;
}
