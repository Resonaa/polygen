import { MapMode } from "~/core/server/game/map";
import { RoomMap } from "~/core/server/room";

type ArrElement<ArrType extends readonly unknown[]> =
  ArrType extends readonly (infer ElementType)[] ? ElementType : never;

export const voteItems = {
  mode: Object.values(MapMode),
  map: Object.values(RoomMap)
};

export type VoteData = {
  [item in keyof typeof voteItems]?: [ArrElement<(typeof voteItems)[item]>, string[]][];
}

function sortVotes(data: VoteData) {
  for (let arr of Object.values(data)) {
    arr.sort(([, a], [, b]) => b.length - a.length);
  }
}

export function vote<T extends keyof typeof voteItems>(data: VoteData, item: T, value: ArrElement<(typeof voteItems)[T]>, player: string) {
  let list = data[item];
  let shouldUpdate = true;
  if (list) {
    const index = list.findIndex(([voteItem,]) => voteItem === item);
    if (index === -1) {
      list.push([value, [player]]);
    } else if (!list[index][1].includes(player)) {
      list[index][1].push(player);
    } else {
      shouldUpdate = false;
    }
  } else {
    data[item] = [[value, [player]]] as any;
  }

  shouldUpdate && sortVotes(data);
  return shouldUpdate;
}