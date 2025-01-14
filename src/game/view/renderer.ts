import type { Palette } from "~/game/palette";

import type { Face } from "../gm";

import * as Settings from "./settings";

import fontObject from "@/static/Noto Sans SC Thin_Regular.json";
import textureJson from "@/static/texture/texture.json";
import textureImage from "@/static/texture/texture.png";

import Worker from "./worker?worker";

import type { MainToWorkerEvent, State } from "./workerEvents";

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

let nextProxyId = 0;
class ElementProxy {
  id = nextProxyId++;
  worker: Worker;

  constructor(element: HTMLElement, worker: Worker) {
    this.worker = worker;

    const sendEvent = (data: object) => {
      this.worker.postMessage({
        type: "event",
        id: this.id,
        data
      });
    };

    // register an id
    worker.postMessage({
      type: "makeProxy",
      id: this.id
    });

    const rect = element.getBoundingClientRect();
    sendEvent({
      type: "size",
      left: rect.left,
      top: rect.top,
      width: element.clientWidth,
      height: element.clientHeight
    });

    for (const [eventName, handler] of Object.entries(eventHandlers)) {
      element.addEventListener(eventName, event => {
        handler(event as TouchEvent, sendEvent);
      });
    }
  }
}

export class Renderer {
  worker = new Worker();

  postMessage<E extends MainToWorkerEvent>(
    message: E,
    transfer?: Transferable[]
  ) {
    this.worker.postMessage(message, transfer ?? []);
  }

  constructor(canvas: HTMLCanvasElement, faces: Face[], palette: Palette) {
    canvas.focus();
    const offscreen = canvas.transferControlToOffscreen();

    const settings = Settings.Default.game;

    const proxy = new ElementProxy(canvas, this.worker);

    const state = {
      height: Math.floor(canvas.clientHeight * devicePixelRatio),
      width: Math.floor(canvas.clientWidth * devicePixelRatio),
      fontObject,
      textureImage,
      textureJson
    } satisfies State;

    this.postMessage(
      {
        type: "start",
        canvas: offscreen,
        canvasId: proxy.id,
        settings,
        faces,
        palette,
        state
      },
      [offscreen]
    );
  }

  render() {
    this.postMessage({ type: "render" });
  }

  reset() {
    this.postMessage({ type: "reset" });
  }

  dispose() {
    this.postMessage({ type: "dispose" });
  }

  set faces(faces: Face[]) {
    this.postMessage({ type: "updateFaces", faces });
  }

  set palette(palette: Palette) {
    this.postMessage({ type: "updatePalette", palette });
  }

  setup() {
    this.postMessage({ type: "setup" });
  }
}
