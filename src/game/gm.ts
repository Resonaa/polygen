export type Edges = number[][];

type Vector = [number, number, number];

export enum FaceType {
  Empty = 0,
  Crown = 1,
  City = 2,
  Desert = 3,
  Lookout = 4,
  Mountain = 5,
  Observatory = 6,
  Satellite = 7,
  Swamp = 8
}

export interface Face {
  position: Vector;
  normal: Vector;
  sides: 4 | 6 | 3;
  radius: number;

  amount: number;
  type: FaceType;
  color: number;
}

export enum GMMode {
  Hexagon = 0,
  Square = 1,
  Triangle = 2,
}

export interface GM {
  mode: GMMode;
  edges: Edges;
  faces: Face[];

  // /**
  //  * Returns the dir array of the given pos.
  //  */
  // dir([x, y]: Pos): [number, number][] {
  //   switch (this.mode) {
  //     case Gm.Mode.Hexagon: {
  //       return y % 2 === 1
  //         ? [
  //             [-1, -1],
  //             [-1, 0],
  //             [-1, 1],
  //             [0, 1],
  //             [1, 0],
  //             [0, -1]
  //           ]
  //         : [
  //             [0, -1],
  //             [-1, 0],
  //             [0, 1],
  //             [1, 1],
  //             [1, 0],
  //             [1, -1]
  //           ];
  //     }
  //     case Gm.Mode.Square: {
  //       return [
  //         [-1, 0],
  //         [0, -1],
  //         [1, 0],
  //         [0, 1]
  //       ];
  //     }
  //     case Gm.Mode.Triangle: {
  //       return (x + y) % 2 === 0
  //         ? [
  //             [1, 0],
  //             [0, -1],
  //             [0, 1]
  //           ]
  //         : [
  //             [-1, 0],
  //             [0, -1],
  //             [0, 1]
  //           ];
  //     }
  //   }
  // }
}
