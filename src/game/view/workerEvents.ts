import type { Face } from "../gm";
import type { Palette } from "../palette";
import type * as Settings from "./settings";

import type fontObject from "@/static/Noto Sans SC Thin_Regular.json";
import type textureJson from "@/static/texture/texture.json";
import type textureImage from "@/static/texture/texture.png";

export interface State {
  width: number;
  height: number;
  fontObject: typeof fontObject;
  textureJson: typeof textureJson;
  textureImage: typeof textureImage;
}

export interface StartEvent {
  type: "start";
  canvas: OffscreenCanvas;
  canvasId: number;
  settings: Settings.Type["game"];
  faces: Face[];
  palette: Palette;
  state: State;
}

export interface DataEvent {
  type: "event";
  id: number;
  data: Event;
}

export interface MakeProxyEvent {
  type: "makeProxy";
  id: number;
}

export interface ResetEvent {
  type: "reset";
}

export interface RenderEvent {
  type: "render";
}

export interface DisposeEvent {
  type: "dispose";
}

export interface UpdateFacesEvent {
  type: "updateFaces";
  faces: Face[];
}

export interface UpdatePaletteEvent {
  type: "updatePalette";
  palette: Palette;
}

export interface SetupEvent {
  type: "setup";
}

export type MainToWorkerEvent =
  | StartEvent
  | DataEvent
  | MakeProxyEvent
  | ResetEvent
  | DisposeEvent
  | UpdateFacesEvent
  | UpdatePaletteEvent
  | RenderEvent
  | SetupEvent;
