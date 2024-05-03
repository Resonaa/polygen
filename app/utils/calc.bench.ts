import _ from "lodash";
import { bench, describe } from "vitest";

for (const [x, approx] of [
  [2, 0.71],
  [3, 0.87]
]) {
  describe(`sqrt ${x} / 2`, () => {
    let tmp = 0;

    const setup = () => {
      tmp = _.random(1, 100, true);
    };

    bench(
      `* Math.sqrt(${x}) / 2`,
      () => {
        void ((tmp * Math.sqrt(x)) / 2);
      },
      {
        setup
      }
    );

    bench(
      `* ${approx}`,
      () => {
        void (tmp * approx);
      },
      {
        setup
      }
    );
  });
}
