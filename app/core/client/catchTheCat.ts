declare class CatchTheCatGame {
  constructor({ w, h, r, parent, statusBarAlign, credit, backgroundColor }:
                {
                  w: number, h: number, r: number, parent: string, statusBarAlign: string,
                  credit: string, backgroundColor: number
                })
}

export function catchTheCat() {
  require("public/js/phaser.min.js");
  require("public/js/catch-the-cat.min.js");

  new CatchTheCatGame({
    w: 17,
    h: 17,
    r: 15,
    parent: "catch-the-cat",
    statusBarAlign: "center",
    credit: "polygen",
    backgroundColor: 0x000000
  });

  return () => {
    const canvas = document.querySelector("canvas");

    if (canvas)
      canvas.outerHTML = "";
  };
}