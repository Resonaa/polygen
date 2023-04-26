import { shuffle } from "~/core/client/utils";
import { MapMode } from "~/core/server/game/map";

type ArrElement<ArrType extends readonly unknown[]> =
  ArrType extends readonly (infer ElementType)[] ? ElementType : never;

export enum RoomMap {
  Random = "随机地图",
  Empty = "空白地图"
}

export const voteItems = {
  mode: [MapMode.Hexagon, MapMode.Square],
  map: [RoomMap.Random, RoomMap.Empty],
  speed: [1, 0.5, 0.75, 1.25, 1.5]
};

export type VoteItem = keyof typeof voteItems;

export const translations: { [item in VoteItem]: string } = {
  mode: "模式",
  map: "地图",
  speed: "速度"
};

export type VoteValue<T extends VoteItem> = ArrElement<(typeof voteItems)[T]>;

export type MaxVotedItems = {
  [item in VoteItem]: VoteValue<item>;
}

export type VoteData = {
  [item in VoteItem]?: [VoteValue<item>, string[]][];
}

function sortVotes(data: VoteData) {
  for (let arr of Object.values(data)) {
    arr && arr.sort(([itemA, a], [itemB, b]) => {
      if (a.length !== b.length) {
        return b.length - a.length;
      } else {
        return itemA.toString() > itemB.toString() ? 1 : -1;
      }
    });
  }
}

export function clearAllVotesOfPlayer(data: VoteData, player: string) {
  let updated = false;

  for (let [key, arr] of Object.entries(data)) {
    const valueIndex = arr.findIndex(([, players]) => players.includes(player));
    if (valueIndex !== -1) {
      const playerId = arr[valueIndex][1].indexOf(player);
      arr[valueIndex][1].splice(playerId, 1);
      updated = true;
      if (arr[valueIndex][1].length === 0) {
        arr.splice(valueIndex, 1);
      }
      if (arr.length === 0) {
        data[key as keyof typeof voteItems] = undefined;
      }
    }
  }

  return updated;
}

export function vote<T extends VoteItem>(data: VoteData, item: T, value: VoteValue<T>, player: string) {
  let list = data[item];
  if (list) {
    const preVotedValueIndex = list.findIndex(([, players]) => players.includes(player));
    if (preVotedValueIndex !== -1) {
      const playerId = list[preVotedValueIndex][1].indexOf(player);
      list[preVotedValueIndex][1].splice(playerId, 1);

      const preVotedValue = list[preVotedValueIndex][0];
      if (list[preVotedValueIndex][1].length === 0) {
        list.splice(preVotedValueIndex, 1);
      }
      if (preVotedValue === value) {
        sortVotes(data);
        return;
      }
    }

    const index = list.findIndex(([voteValue,]) => voteValue === value);
    if (index === -1) {
      list.push([value, [player]]);
    } else {
      list[index][1].push(player);
    }
  } else {
    data[item] = [[value, [player]]] as any;
  }

  sortVotes(data);
}

export function getMaxVotedItem(data: VoteData) {
  let ans: Partial<MaxVotedItems> = {};
  for (let key in voteItems) {
    const item = key as VoteItem;
    if (data[item] && data[item]?.length) {
      const items = data[item] as Array<ArrElement<NonNullable<VoteData[typeof item]>>>;
      let choices = items.filter(([, players]) => players.length === items[0][1].length);
      shuffle(choices);
      ans[item] = choices[0][0] as any;
    } else {
      ans[item] = voteItems[item][0] as any;
    }
  }
  return ans as MaxVotedItems;
}