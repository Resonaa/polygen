import { sample as sampleFrom } from "lodash";

import { MapMode } from "./map/map";

type ArrElement<ArrType extends readonly unknown[]> =
  ArrType extends readonly (infer ElementType)[] ? ElementType : never;

export enum RoomMap {
  Random = "Random",
  Empty = "Empty",
  Maze = "Maze",
  Plot = "Plot"
}

export const voteItems = {
  mode: [MapMode.Hexagon, MapMode.Square],
  map: [RoomMap.Random, RoomMap.Empty, RoomMap.Maze, RoomMap.Plot],
  speed: [1, 0.5, 0.75, 1.25, 1.5, 1.75, 2]
};

export type VoteItem = keyof typeof voteItems;

export const translations: { [item in VoteItem]: string } = {
  mode: "Mode",
  map: "Map",
  speed: "Speed"
};

export type VoteValue<T extends VoteItem> = ArrElement<(typeof voteItems)[T]>;

export type MaxVotedItems = typeof voteItems;

export type Vote<T extends VoteItem = VoteItem> = [T, VoteValue<T>];

export type SampleMaxVotedItems = {
  [item in VoteItem]: VoteValue<item>;
};

export type VoteData = {
  [item in VoteItem]?: [VoteValue<item>, string[]][];
};

export class VoteManager {
  data: VoteData = {};
  ans = (() => {
    const ans: Partial<MaxVotedItems> = {};
    for (const key in voteItems) {
      const value = voteItems[key as VoteItem][0];
      (ans[key as VoteItem] as (typeof value)[]) = [value];
    }
    return ans as MaxVotedItems;
  })();

  sort() {
    for (const arr of Object.values(this.data)) {
      arr.sort(([itemA, a], [itemB, b]) => {
        if (a.length !== b.length) {
          return b.length - a.length;
        } else {
          return itemA.toString() > itemB.toString() ? 1 : -1;
        }
      });
    }

    for (const key in voteItems) {
      const item = key as VoteItem;
      if (this.data[item]?.length) {
        const items = this.data[item] as ArrElement<
          NonNullable<VoteData[typeof item]>
        >[];
        const choices = items.filter(
          ([, players]) => players.length === items[0][1].length
        );
        this.ans[item] = choices[0] as never;
      } else {
        this.ans[item] = [voteItems[item][0]] as never;
      }
    }
  }

  remove(player: string) {
    let updated = false;

    for (const [key, arr] of Object.entries(this.data)) {
      const valueIndex = arr.findIndex(([, players]) =>
        players.includes(player)
      );

      if (valueIndex !== -1) {
        const playerId = arr[valueIndex][1].indexOf(player);
        arr[valueIndex][1].splice(playerId, 1);
        updated = true;
        if (arr[valueIndex][1].length === 0) {
          arr.splice(valueIndex, 1);
        }
        if (arr.length === 0) {
          this.data[key as VoteItem] = undefined;
        }
      }
    }

    if (updated) {
      this.sort();
    }

    return updated;
  }

  add<T extends VoteItem>(item: T, value: VoteValue<T>, player: string) {
    const list = this.data[item];
    if (list) {
      const preVotedValueIndex = list.findIndex(([, players]) =>
        players.includes(player)
      );
      if (preVotedValueIndex !== -1) {
        const playerId = list[preVotedValueIndex][1].indexOf(player);
        list[preVotedValueIndex][1].splice(playerId, 1);

        const preVotedValue = list[preVotedValueIndex][0];
        if (list[preVotedValueIndex][1].length === 0) {
          list.splice(preVotedValueIndex, 1);
        }
        if (preVotedValue === value) {
          this.sort();
          return;
        }
      }

      const index = list.findIndex(([voteValue]) => voteValue === value);
      if (index === -1) {
        list.push([value, [player]]);
      } else {
        list[index][1].push(player);
      }
    } else {
      this.data[item] = [[value, [player]]] as VoteData[T];
    }

    this.sort();
  }

  sample() {
    const sample: Partial<SampleMaxVotedItems> = {};

    for (const [key, value] of Object.entries(this.ans)) {
      const item = sampleFrom(value) as ArrElement<typeof value>;
      (sample[key as keyof SampleMaxVotedItems]! as typeof item) = item;
    }

    return sample as SampleMaxVotedItems;
  }
}
