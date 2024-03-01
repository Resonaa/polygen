import LZString from "lz-string";
import type { PartialDeep } from "type-fest";

import { MapMode } from "~/core/server/map/map";
import { merge } from "~/utils/merge";

export type IKey = string;

export interface IKeys {
  move: IKey[];
  selectHome: IKey;
  selectTopLeft: IKey;
  splitArmy: IKey;
  clearMovements: IKey;
  surrender: IKey;
  undoMovement: IKey;
}

export type IColor = number;

export enum Controls {
  Keyboard = "Keyboard",
  Touch = "Touch",
  Auto = "Auto"
}

export interface ISettings {
  game: {
    keys: {
      [mode in MapMode]: IKeys;
    };
    colors: {
      standard: IColor[];
      selectedBorder: IColor;
      empty: IColor;
      mountain: IColor;
      unknown: IColor;
    };
    controls: Controls;
  };
}

export class Settings {
  private readonly settings: PartialDeep<ISettings>;
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
        standard: [
          0x808080, 0xff0000, 0x4363d8, 0x008000, 0x008080, 0xf58231, 0xf032e6,
          0x800080, 0x800000, 0xb09f30, 0x9a6324, 0x0000ff, 0x483d8b, 0x9acd32,
          0xff1493, 0x3e2cbb, 0xff6347
        ],
        selectedBorder: 0xffffff,
        empty: 0xdcdcdc,
        mountain: 0xbbbbbb,
        unknown: 0x424242
      },
      controls: Controls.Auto
    }
  };

  constructor(settings: PartialDeep<ISettings>) {
    this.settings = settings;
  }

  merge() {
    return merge<ISettings>(Settings.defaultSettings, this.settings);
  }
}

export const SETTINGS_KEY = "settings";

export function getSettings() {
  const s = localStorage.getItem(SETTINGS_KEY)!;

  try {
    const partial = JSON.parse(
      LZString.decompressFromUTF16(s)
    ) as PartialDeep<ISettings>;

    return new Settings(partial).merge();
  } catch {
    return new Settings({}).merge();
  }
}

export function saveSettings(settings: ISettings) {
  localStorage.setItem(
    SETTINGS_KEY,
    LZString.compressToUTF16(JSON.stringify(settings))
  );
}
