import type { GM, RP } from "@polygen/wasm";
import { type ProxyMarked, proxy, transfer } from "comlink";

import type { Palette } from "~/game/palette";

import * as Settings from "./settings";

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
      enumerable: true,
      value: src[name as keyof typeof src]
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
  sendFn({ touches, type: event.type });
}

const eventHandlers = {
  click: mouseEventHandler,
  contextmenu: preventDefaultHandler,
  mousedown: mouseEventHandler,
  mousemove: mouseEventHandler,
  mouseup: mouseEventHandler,
  pointerdown: mouseEventHandler,
  pointermove: mouseEventHandler,
  pointerup: mouseEventHandler,
  touchend: touchEventHandler,
  touchmove: touchEventHandler,
  touchstart: touchEventHandler,
  wheel: wheelEventHandler
};

export class Renderer {
  canvas: HTMLCanvasElement;
  settings = Settings.Default.game;

  handleMove: (key: string) => Promise<void> = async (key: string) => {
    console.log("handleMove", key);
    const matched = await this.worker.getMatchedMove(key);
    console.log(matched);
  };

  // @ts-ignore
  worker = new ComlinkWorker(new URL("./worker.ts", import.meta.url), {
    module: true
  });

  private proxiedGM: GM & ProxyMarked;
  private proxiedRP: RP & ProxyMarked;

  async resizeListener() {
    await this.worker.setCanvasSize({
      height: Math.floor(this.canvas.clientHeight * devicePixelRatio),
      width: Math.floor(this.canvas.clientWidth * devicePixelRatio)
    });
  }

  async keyDownListener(e: KeyboardEvent) {
    this.handleMove(e.key);
  }

  constructor(canvas: HTMLCanvasElement, gm: GM, rp: RP, palette: Palette) {
    this.canvas = canvas;
    canvas.focus();
    const offscreen = canvas.transferControlToOffscreen();

    const sendEvent: SendFn = event => {
      this.worker.handleEvent(event as Event);
    };

    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      canvas.addEventListener(eventName, event => {
        handler(event as TouchEvent, sendEvent);
      });
    }

    window.addEventListener("resize", this.resizeListener.bind(this));
    canvas.addEventListener("keydown", this.keyDownListener.bind(this));

    this.proxiedGM = proxy(gm);
    this.proxiedRP = proxy(rp);

    (async () => {
      await this.resizeListener();
      const { left, top } = canvas.getBoundingClientRect();
      await this.worker.setCanvasBounding({
        left,
        top
      });
      await this.worker.setConfig({
        devicePixelRatio,
        palette,
        settings: this.settings
      });
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
    this.canvas.removeEventListener("keydown", this.keyDownListener);
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
