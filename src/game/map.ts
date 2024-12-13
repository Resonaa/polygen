import * as THREE from "three";

interface Block {
  pos: THREE.Vector2;
  yIndex: number;
}

enum FaceType {
  Empty,
  Crown,
  City,
  Swamp
}

export interface Face extends Block {
  id: number;
  dir: number;
  color: number;
  amount: number;
  type: FaceType;
}

function hash({ pos, yIndex }: Block) {
  return pos.toArray().toString() + "," + yIndex;
}

class Gm extends Array<Face> {
  /**
   * Map modes.
   */
  static readonly Mode = {
    Hexagon: "Hexagon",
    Square: "Square",
    Triangle: "Triangle"
  } as const;

  static readonly Sides = {
    [Gm.Mode.Hexagon]: 6,
    [Gm.Mode.Square]: 4,
    [Gm.Mode.Triangle]: 3
  };

  mode: keyof typeof Gm.Mode;

  private posIndex = new Map<string, number[]>();

  constructor(mode: Gm["mode"]) {
    super();

    this.mode = mode;
  }

  calculateFaceId() {
    for (const [id, face] of this.entries()) {
      face.id = id;
    }
  }

  calculatePosIndex() {
    this.posIndex.clear();

    for (const [id, face] of this.entries()) {
      const key = hash(face);
      const entry = this.posIndex.get(key);

      if (entry) {
        entry.push(id);
      } else {
        this.posIndex.set(key, [id]);
      }
    }
  }

  /**
   * Returns the dir array of the given pos.
   */
  dir({ x, y }: THREE.Vector2): THREE.Vector2[] {
    switch (this.mode) {
      case Gm.Mode.Hexagon: {
        return y % 2 === 1
          ? [
              new THREE.Vector2(1, 0),
              new THREE.Vector2(0, 1),
              new THREE.Vector2(-1, 1),
              new THREE.Vector2(-1, 0),
              new THREE.Vector2(-1, -1),
              new THREE.Vector2(0, -1)
            ]
          : [
              new THREE.Vector2(1, 0),
              new THREE.Vector2(1, 1),
              new THREE.Vector2(0, 1),
              new THREE.Vector2(-1, 0),
              new THREE.Vector2(0, -1),
              new THREE.Vector2(1, -1)
            ];
      }
      case Gm.Mode.Square: {
        return [
          new THREE.Vector2(1, 0),
          new THREE.Vector2(0, 1),
          new THREE.Vector2(-1, 0),
          new THREE.Vector2(0, -1)
        ];
      }
      case Gm.Mode.Triangle: {
        return (x + y) % 2 === 0
          ? [
              new THREE.Vector2(1, 0),
              new THREE.Vector2(0, 1),
              new THREE.Vector2(0, -1)
            ]
          : [
              new THREE.Vector2(-1, 0),
              new THREE.Vector2(0, -1),
              new THREE.Vector2(0, 1)
            ];
      }
    }
  }

  facesOnBlock(block: Block) {
    return (this.posIndex.get(hash(block)) ?? []).map(faceId => this[faceId]);
  }

  faceOnBlock(block: Block, dir: number) {
    return this.facesOnBlock(block).find(face => face.dir === dir);
  }

  neighboringBlocks(block: Block) {
    const ans = [];

    const { yIndex, pos } = block;

    for (const y of [yIndex - 1, yIndex + 1]) {
      const block = { pos, yIndex: y };
      const faces = this.facesOnBlock(block);

      if (faces.length > 0) {
        ans.push(block);
      }
    }

    for (const d of this.dir(pos)) {
      const block = { pos: d.add(pos), yIndex };
      const faces = this.facesOnBlock(block);

      if (faces.length > 0) {
        ans.push(block);
      }
    }

    return ans;
  }
}

export { Gm as Map };
