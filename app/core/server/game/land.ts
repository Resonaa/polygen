export const enum LandType {
  Land,
  General,
  City,
  Mountain,
  Obstacle,
  Unknown
}

export class Land {
  color: number;
  type: LandType;
  amount: number;

  constructor(color: number = 0, type: LandType = LandType.Land, amount: number = 0) {
    this.color = color;
    this.type = type;
    this.amount = amount;
  }
}