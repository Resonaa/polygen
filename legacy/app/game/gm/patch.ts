import type { Pos } from "./matrix";

/**
 * A single patch object consisting of a position and an item.
 */
export class Patch<Item> extends Array<Pos | Item> {
  /**
   * Patch position.
   */
  get pos() {
    return this[0] as Pos;
  }

  /**
   * Patch item.
   */
  get item() {
    return this[1] as Item;
  }

  /**
   * Creates a new Patch with the given position and item.
   */
  constructor(pos: Pos, item: Item) {
    super(pos, item);
  }
}
