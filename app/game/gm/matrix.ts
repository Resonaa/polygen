import { isEqual } from "lodash";

import { Patch } from "./patch";

/**
 * Positions in a Matrix.
 */
export type Pos = [number, number];

/**
 * Basic matrix extended from two-dimensional Array.
 *
 * A Matrix supports indexing, updating, diffing and patching.
 */
export class Matrix<Item> extends Array<Item[]> {
  /**
   * Matrix height.
   */
  get height() {
    return this.length - 1;
  }

  /**
   * Matrix width.
   */
  get width() {
    return this[0].length - 1;
  }

  /**
   * Not meant to be called directly.
   */
  private constructor(...args: ConstructorParameters<typeof Array<Item[]>>) {
    super(...args);
  }

  /**
   * Creates a Matrix from iterables.
   */
  static from<Item>(iterables: Item[][]) {
    return new this(...iterables);
  }

  /**
   * Creates a Matrix with the given width and height,
   * filling in the default value resolved by a function provided by the caller.
   *
   * The function will be called each time to produce an isolated value.
   */
  static defaultWith<Item>(
    height: number,
    width: number,
    defaultFunction: () => Item
  ) {
    const matrix = new this<Item>();

    for (let i = 0; i <= height; i++) {
      matrix.push([]);

      for (let j = 0; j <= width; j++) {
        matrix[i].push(defaultFunction());
      }
    }

    return matrix;
  }

  /**
   * Creates a Matrix with the given width and height,
   * filling in the default value provided by the caller.
   *
   * This function uses Matrix.defaultWith internally.
   */
  static default<Item>(height: number, width: number, defaultValue: Item) {
    return this.defaultWith(height, width, () => defaultValue);
  }

  /**
   * Gets a particular item.
   */
  get([x, y]: Pos) {
    return this[x][y];
  }

  /**
   * Updates a particular item.
   */
  set([x, y]: Pos, item: Item) {
    this[x][y] = item;
  }

  /**
   * Checks whether the position is in the Matrix.
   */
  check([x, y]: Pos) {
    return x >= 1 && x <= this.height && y >= 1 && y <= this.width;
  }

  /**
   * Returns an array of all positions in the Matrix for iterating.
   */
  positions() {
    const ans = [];

    for (let i = 1; i <= this.height; i++) {
      for (let j = 1; j <= this.width; j++) {
        ans.push([i, j] as Pos);
      }
    }

    return ans;
  }

  /**
   * Diffs two matrices and returns the Patch array.
   */
  diff(other: Matrix<Item>) {
    return this.positions()
      .filter(pos => !isEqual(this.get(pos), other.get(pos)))
      .map(pos => new Patch(pos, other.get(pos)));
  }
}
