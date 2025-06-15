import type { Palette } from "~/game/palette";

import type { GM, RP } from "@polygen/wasm";

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
  private proxiedRP: RP & ProxyMarked;

  async resizeListener() {
    await this.worker.setCanvasSize({
      width: Math.floor(this.canvas.clientWidth * devicePixelRatio),
      height: Math.floor(this.canvas.clientHeight * devicePixelRatio)
    });
  }

  constructor(canvas: HTMLCanvasElement, gm: GM, rp: RP, palette: Palette) {
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
    this.proxiedRP = proxy(rp);

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
      // @ts-ignore
      await this.worker.setRP(this.proxiedRP);
      await this.worker.start(transfer(offscreen, [offscreen]));
    })();
  }

  async render() {
    await this.worker.render();
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

  get rp() {
    return this.proxiedRP;
  }

  set gm(gm: GM) {
    this.proxiedGM.free();
    this.proxiedGM = proxy(gm);
    this.worker.setGM(this.proxiedGM);
  }

  set rp(rp: RP) {
    this.proxiedRP.free();
    this.proxiedRP = proxy(rp);
    this.worker.setRP(this.proxiedRP);
  }

  set palette(palette: Palette) {
    this.worker.setConfig({ palette });
  }

  async setup() {
    await this.worker.setup();
  }
}
