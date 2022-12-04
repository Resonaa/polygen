export function catchTheCat() {
  require("public/js/phaser.min.js");
  require("public/js/catch-the-cat.min.js");

  // @ts-ignore
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