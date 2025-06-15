import { type GM, GMMode, type RP, generate_random } from "@polygen/wasm";
import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import random from "lodash/random";
import { Palette } from "./game/palette";
import { Renderer } from "./game/view/renderer";

let renderer: Renderer;
let gm: GM;
let rp: RP;
let palette: Palette;

function generate() {
  const players = random(2, 2);
  const widthRatio = random(0, 1, true);
  const heightRatio = random(0, 1, true);
  const mode = GMMode.Square;
  //const yRatio = random(0, 1, true);
  const yRatio = 0.5;
  const cityDensity = random(0, 1, true);

  const gen = generate_random(
    players,
    mode,
    widthRatio,
    heightRatio,
    yRatio,
    cityDensity
  );

  gm = gen.gm();
  rp = gen.rp();
  console.log(gm.size);
  palette = Palette.colors(players);
  gen.free();
}

@customElement("map-viewer")
export class MapViewer extends LitElement {
  @query("canvas")
  _canvas!: HTMLCanvasElement;

  render() {
    return html`
      <div class="box">
        <div>
          <canvas tabindex="0"></canvas>
        </div>

        <div>
          <md-filled-button @click=${this._onReset}>Reset</md-filled-button>
        </div>
      </div>
    `;
  }

  firstUpdated() {
    this._onReset();
  }

  disconnectedCallback() {
    renderer.dispose();
    super.disconnectedCallback();
  }

  private _onReset() {
    generate();

    if (renderer) {
      renderer.reset();
      renderer.gm = gm;
      renderer.rp = rp;
      renderer.palette = palette;
      renderer.setup().then(() => renderer.render());
    } else {
      renderer = new Renderer(this._canvas, gm, rp, palette);
    }
  }

  static styles = css`
    div {
      display: flex;
      justify-content: center;
    }

    .box {
      flex-direction: column;
      margin: 2rem;
      gap: 1rem;
    }

    canvas {
      width: 90vw;
      height: 80vh;
      touch-action: none;

      &:focus {
        outline: none;
      }
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "map-viewer": MapViewer;
  }
}
