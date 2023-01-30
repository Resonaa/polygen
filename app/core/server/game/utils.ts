export function getDir(row: number) {
  if (row % 2 === 0) {
    return [[-1, 0], [-1, 1], [0, 1], [1, 1], [1, 0], [0, -1]];
  } else {
    return [[-1, -1], [-1, 0], [0, 1], [1, 0], [1, -1], [0, -1]];
  }
}