import type { Palette } from "~/game/palette";

import type { GM } from "@polygen/gm";

import * as Settings from "./settings";

import { type ProxyMarked, proxy, transfer } from "comlink";

type SendFn = (data: object) => void;

const mouseEventHandler = makeSendPropertiesHandler([
  "ctrlKey",
  "metaKey",
  "shiftKey",
  "button",
  "pointerType",
  "pointerId",
  "clientX",
  "clientY",
  "pageX",
  "pageY"
]);
const wheelEventHandlerImpl = makeSendPropertiesHandler(["deltaX", "deltaY"]);

function wheelEventHandler(event: Event, sendFn: SendFn) {
  event.preventDefault();
  wheelEventHandlerImpl(event, sendFn);
}

function preventDefaultHandler(event: Event) {
  event.preventDefault();
}

function copyProperties(src: object, properties: string[], dst: object) {
  for (const name of properties) {
    Object.defineProperty(dst, name, {
      value: src[name as keyof typeof src],
      enumerable: true
    });
  }
}

function makeSendPropertiesHandler(properties: string[]) {
  return function sendProperties(event: Event, sendFn: SendFn) {
    const data = { type: event.type };
    copyProperties(event, properties, data);
    sendFn(data);
  };
}

function touchEventHandler(event: TouchEvent, sendFn: SendFn) {
  const touches = [];
  for (let i = 0; i < event.touches.length; ++i) {
    const { pageX, pageY } = event.touches[i];
    touches.push({ pageX, pageY });
  }
  sendFn({ type: event.type, touches });
}

const eventHandlers = {
  contextmenu: preventDefaultHandler,
  mousedown: mouseEventHandler,
  mousemove: mouseEventHandler,
  mouseup: mouseEventHandler,
  pointerdown: mouseEventHandler,
  pointermove: mouseEventHandler,
  pointerup: mouseEventHandler,
  touchstart: touchEventHandler,
  touchmove: touchEventHandler,
  touchend: touchEventHandler,
  wheel: wheelEventHandler
};

export class Renderer {
  canvas: HTMLCanvasElement;

  // @ts-ignore
  worker = new ComlinkWorker(new URL("./worker.ts", import.meta.url), {
    module: true
  });

  private proxiedGM: GM & ProxyMarked;

  async resizeListener() {
    await this.worker.setCanvasSize({
      width: Math.floor(this.canvas.clientWidth * devicePixelRatio),
      height: Math.floor(this.canvas.clientHeight * devicePixelRatio)
    });
  }

  constructor(canvas: HTMLCanvasElement, gm: GM, palette: Palette) {
    this.canvas = canvas;
    canvas.focus();
    const offscreen = canvas.transferControlToOffscreen();

    const settings = Settings.Default.game;

    const sendEvent: SendFn = event => {
      this.worker.handleEvent(event as Event);
    };

    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      canvas.addEventListener(eventName, event => {
        handler(event as TouchEvent, sendEvent);
      });
    }

    window.addEventListener("resize", this.resizeListener.bind(this));

    this.proxiedGM = proxy(gm);

    (async () => {
      await this.resizeListener();
      const { left, top } = canvas.getBoundingClientRect();
      await this.worker.setCanvasBounding({
        left,
        top
      });
      await this.worker.setConfig({ settings, palette });
      // @ts-ignore
      await this.worker.setGM(this.proxiedGM);
      await this.worker.start(transfer(offscreen, [offscreen]));
    })();
  }

  render() {
    this.worker.render();
  }

  reset() {
    this.worker.reset();
  }

  dispose() {
    this.worker.dispose();
    window.removeEventListener("resize", this.resizeListener);
  }

  get gm() {
    return this.proxiedGM;
  }

  set gm(gm: GM) {
    this.proxiedGM.free();
    this.proxiedGM = proxy(gm);
    this.worker.setGM(this.proxiedGM);
  }

  set palette(palette: Palette) {
    this.worker.setConfig({ palette });
  }

  setup() {
    this.worker.setup();
  }
}
