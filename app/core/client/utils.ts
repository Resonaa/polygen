export function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function shuffle(array: Array<any>) {
  for (let i = 1; i < array.length; i++) {
    const j = randInt(0, i - 1);

    const tmp = array[i];
    array[i] = array[j];
    array[j] = tmp;
  }
}