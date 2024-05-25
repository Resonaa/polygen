/**
 * Map land.
 */
export class Land extends Array<number> {
  /**
   * Land types.
   */
  static Type = {
    Land: 0,
    Crown: 1,
    City: 2,
    Mountain: 3,
    Obstacle: 4,
    Fog: 5,
    Swamp: 6,
    UnknownSwamp: 7
  } as const;

  /**
   * Land color.
   */
  get color() {
    return this[0];
  }

  set color(color: number) {
    this[0] = color;
  }

  /**
   * Land type.
   */
  get type() {
    return this[1];
  }

  set type(type: number) {
    this[1] = type;
  }

  /**
   * Land amount.
   */
  get amount() {
    return this[2];
  }

  set amount(amount: number) {
    this[2] = amount;
  }

  /**
   * Tests whether this Land is accessible.
   */
  accessible() {
    return this.type !== Land.Type.Mountain;
  }

  /**
   * Tests whether this Land is visible.
   */
  visible() {
    return (
      this.type !== Land.Type.Obstacle &&
      this.type !== Land.Type.Fog &&
      this.type !== Land.Type.UnknownSwamp
    );
  }

  /**
   * Creates a Land with given color, type and amount.
   */
  constructor(color = 0, type = 0, amount = 0) {
    super(color, type, amount);
  }
}
