/**
 * Map land.
 */
export class Land extends Array<number> {
  /**
   * Land types.
   */
  static Type = {
    Land: 0,
    General: 1,
    City: 2,
    Mountain: 3,
    UnknownCity: 4,
    Unknown: 5,
    UnknownMountain: 6,
    Swamp: 7
  } as const;

  /**
   * Land color.
   */
  get color() {
    return this[0];
  }

  /**
   * Land type.
   */
  get type() {
    return this[1];
  }

  /**
   * Land amount.
   */
  get amount() {
    return this[2];
  }

  /**
   * Creates a Land with given color, type and amount.
   */
  constructor(color = 0, type = 0, amount = 0) {
    super(color, type, amount);
  }
}
