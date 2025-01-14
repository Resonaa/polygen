import { EventDispatcher } from "three";
import type {
  DataEvent,
  MainToWorkerEvent,
  MakeProxyEvent,
  StartEvent,
  UpdateFacesEvent,
  UpdatePaletteEvent
} from "./workerEvents";
import { WorkerInit } from "./workerInit";

let workerInit: WorkerInit | undefined;

function noop() {}

class ElementProxyReceiver extends EventDispatcher<Record<string, Event>> {
  // OrbitControls try to set style.touchAction
  style = {};

  left = 0;
  top = 0;
  width = 0;
  height = 0;
  devicePixelRatio = 0;

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
    if (data.type === "size") {
      const { top, left, width, height } = data as unknown as Pick<
        ElementProxyReceiver,
        "top" | "left" | "width" | "height"
      >;
      this.left = left;
      this.top = top;
      this.width = width;
      this.height = height;
      return;
    }

    data.preventDefault = noop;
    data.stopPropagation = noop;
    this.dispatchEvent(data);
  }

  focus = noop;
}

class ProxyManager {
  targets: Record<number, ElementProxyReceiver> = {};

  constructor() {
    this.handleEvent = this.handleEvent.bind(this);
  }

  makeProxy({ id }: MakeProxyEvent) {
    const proxy = new ElementProxyReceiver();
    this.targets[id] = proxy;
  }

  getProxy(id: number) {
    return this.targets[id] as unknown as HTMLElement;
  }

  handleEvent(data: DataEvent) {
    this.targets[data.id].handleEvent(data.data);
  }
}

const proxyManager = new ProxyManager();

function start(data: StartEvent) {
  const proxy = proxyManager.getProxy(data.canvasId);

  workerInit = new WorkerInit(
    data.canvas,
    proxy,
    data.faces,
    data.palette,
    data.settings,
    data.state
  );
}

function makeProxy(data: MakeProxyEvent) {
  proxyManager.makeProxy(data);
}

function reset() {
  workerInit?.reset();
}

function dispose() {
  workerInit?.dispose();
}

function render() {
  workerInit?.render();
}

function setup() {
  workerInit?.setup();
}

function updateFaces({ faces }: UpdateFacesEvent) {
  if (workerInit) {
    workerInit.faces = faces;
  }
}

function updatePalette({ palette }: UpdatePaletteEvent) {
  if (workerInit) {
    workerInit.palette = palette;
  }
}

const handlers = {
  start,
  makeProxy,
  event: proxyManager.handleEvent,
  reset,
  dispose,
  render,
  updateFaces,
  updatePalette,
  setup
};

self.onmessage = ({ data }: MessageEvent<MainToWorkerEvent>) => {
  // @ts-ignore
  handlers[data.type](data);
};
