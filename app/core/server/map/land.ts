export const enum LandType {
  Land,
  General,
  City,
  Mountain,
  UnknownCity,
  Unknown,
  UnknownMountain
}

export type LandColor = number;

export interface MaybeLand {
  c: LandColor;
  t: LandType;
  a: number;
}

export class Land {
  color: LandColor;
  type: LandType;
  amount: number;

  constructor(
    color: LandColor = 0,
    type: LandType = LandType.Land,
    amount = 0
  ) {
    this.color = color;
    this.type = type;
    this.amount = amount;
  }

  static from({ c, t, a }: MaybeLand) {
    return new this(c, t, a);
  }

  export(): MaybeLand {
    return { c: this.color, t: this.type, a: this.amount };
  }
}
