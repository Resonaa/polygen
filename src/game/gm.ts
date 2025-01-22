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

export interface GM {
  edges: Edges;
  faces: Face[];
}
