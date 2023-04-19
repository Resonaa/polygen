import LZString from "lz-string";


import { MapMode } from "~/core/server/game/map";

export type IKey = string;

export interface IKeys {
  move: IKey[],
  selectHome: IKey,
  selectTopLeft: IKey,
  splitArmy: IKey,
  clearMovements: IKey,
  surrender: IKey
}

export interface ISettings {
  game: {
    keys: {
      [MapMode.Hexagon]: IKeys,
      [MapMode.Square]: IKeys
    }
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
          surrender: "ESCAPE"
        },
        [MapMode.Square]: {
          move: ["W", "A", "S", "D"],
          clearMovements: "F",
          splitArmy: "R",
          selectHome: "G",
          selectTopLeft: "Space",
          surrender: "ESCAPE"
        }
      }
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
  } catch (_) {
    return new Settings({}).merge();
  }
}

export function saveSettings(settings: ISettings) {
  localStorage.setItem(SETTINGS_KEY, LZString.compressToUTF16(JSON.stringify(settings)));
}