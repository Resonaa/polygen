import type { Palette } from "~/game/palette";

import type { Face } from "../gm";

import * as Settings from "./settings";

import fontObject from "@/static/Noto Sans SC Thin_Regular.json";
import textureJson from "@/static/texture/texture.json";
import textureImage from "@/static/texture/texture.png";

import type { State } from "./workerState";

import { transfer, wrap } from "comlink";
import Worker from "./worker?worker";

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
  worker = wrap<typeof import("./workerInit")>(new Worker());

  constructor(canvas: HTMLCanvasElement, faces: Face[], palette: Palette) {
    canvas.focus();
    const offscreen = canvas.transferControlToOffscreen();

    const settings = Settings.Default.game;

    const state = {
      height: Math.floor(canvas.clientHeight * devicePixelRatio),
      width: Math.floor(canvas.clientWidth * devicePixelRatio),
      fontObject,
      textureImage,
      textureJson
    } satisfies State;

    const sendEvent: SendFn = event => {
      this.worker.handleEvent(event as Event);
    };

    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      canvas.addEventListener(eventName, event => {
        handler(event as TouchEvent, sendEvent);
      });
    }

    const rect = canvas.getBoundingClientRect();

    (async () => {
      await this.worker.setCanvasBounding({
        left: rect.left,
        top: rect.top,
        width: canvas.clientWidth,
        height: canvas.clientHeight
      });
      await this.worker.set({ settings, state, palette, faces });
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
  }

  set faces(faces: Face[]) {
    this.worker.set({ faces });
  }

  set palette(palette: Palette) {
    this.worker.set({ palette });
  }

  setup() {
    this.worker.setup();
  }
}
