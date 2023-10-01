import LZString from "lz-string";

import { MapMode } from "~/core/server/game/map";

export type IKey = string;

export interface IKeys {
  move: IKey[],
  selectHome: IKey,
  selectTopLeft: IKey,
  splitArmy: IKey,
  clearMovements: IKey,
  surrender: IKey,
  undoMovement: IKey
}

export type IColor = number;

export enum Controls {
  Keyboard = "键盘",
  Touch = "触控",
  Auto = "自动适配"
}

export interface ISettings {
  game: {
    keys: {
      [mode in MapMode]: IKeys
    },
    colors: {
      standard: IColor[],
      selectedBorder: IColor,
      empty: IColor,
      mountain: IColor,
      unknown: IColor
    },
    controls: Controls
  };
}

function merge(from: any, to: any) {
  let target: any = {};

  for (const prop in from) {
    if (from.hasOwnProperty(prop)) {
      if (!to.hasOwnProperty(prop)) {
        target[prop] = from[prop];
      } else if (Object.prototype.toString.call(from[prop]) === "[object Object]") {
        target[prop] = merge(from[prop], to[prop]);
      } else {
        target[prop] = to[prop];
      }
    }
  }

  return target;
}

export class Settings {
  private readonly settings: Partial<ISettings>;
  static defaultSettings: ISettings = {
    game: {
      keys: {
        [MapMode.Hexagon]: {
          move: ["Q", "W", "E", "D", "S", "A"],
          clearMovements: "F",
          splitArmy: "R",
          selectHome: "G",
          selectTopLeft: "Space",
          surrender: "ESCAPE",
          undoMovement: "C"
        },
        [MapMode.Square]: {
          move: ["W", "A", "S", "D"],
          clearMovements: "F",
          splitArmy: "R",
          selectHome: "G",
          selectTopLeft: "Space",
          surrender: "ESCAPE",
          undoMovement: "C"
        }
      },
      colors: {
        standard: [0x808080, 0xff0000, 0x4363d8, 0x008000, 0x008080, 0xf58231, 0xf032e6,
          0x800080, 0x800000, 0xb09f30, 0x9a6324, 0x0000ff, 0x483d8b, 0x9acd32, 0xff1493, 0x3e2cbb, 0xff6347],
        selectedBorder: 0xffffff,
        empty: 0xdcdcdc,
        mountain: 0xbbbbbb,
        unknown: 0x424242
      },
      controls: Controls.Auto
    }
  };

  constructor(settings: Partial<ISettings>) {
    this.settings = settings;
  }

  merge() {
    return merge(Settings.defaultSettings, this.settings) as ISettings;
  }
}

export const SETTINGS_KEY = "settings";

export function getSettings() {
  const s = localStorage.getItem(SETTINGS_KEY) as string;

  try {
    return new Settings(JSON.parse(LZString.decompressFromUTF16(s))).merge();
  } catch {
    return new Settings({}).merge();
  }
}

export function saveSettings(settings: ISettings) {
  localStorage.setItem(SETTINGS_KEY, LZString.compressToUTF16(JSON.stringify(settings)));
}