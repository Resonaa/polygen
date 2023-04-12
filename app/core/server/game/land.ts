export const enum LandType {
  Land,
  General,
  City,
  Mountain,
  UnknownCity,
  Unknown,
  UnknownMountain,
}

export type LandColor = number;

export interface MaybeLand {
  color: LandColor;
  type: LandType;
  amount: number;
}

export class Land {
  color: LandColor;
  type: LandType;
  amount: number;

  constructor(color: LandColor = 0, type: LandType = LandType.Land, amount: number = 0) {
    this.color = color;
    this.type = type;
    this.amount = amount;
  }

  static from(maybeLand: MaybeLand) {
    let land = new this();

    land.color = maybeLand.color;
    land.type = maybeLand.type;
    land.amount = maybeLand.amount;

    return land;
  }
}