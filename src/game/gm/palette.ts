import generateColors from "iwanthue";

/**
 * A palette consisting of different standard colors.
 */
export class Palette extends Array<number> {
  /**
   * Not meant to be called directly.
   */
  constructor(...args: ConstructorParameters<typeof Array<number>>) {
    super(...args);
  }

  /**
   * Creates a Palette with (n + 1) standard colors.
   *
   * The first color is fixed to grey.
   */
  static colors(n: number) {
    return new Palette(
      0x808080,
      ...generateColors(n, {
        colorSpace: [0, 360, 25, 85, 45, 70],
        clustering: "force-vector"
      }).map(color => parseInt(color.substring(1), 16))
    );
  }
}
