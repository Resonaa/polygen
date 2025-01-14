import { LitElement, css, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { random } from "lodash";
import { generateGM } from "~/game/generator/common";
import type { GM, GMMode } from "~/game/gm";
import { Palette } from "./game/palette";
import { Renderer } from "./game/view/renderer";

let renderer: Renderer;
let gm: GM;
let palette: Palette;

function generate() {
  const players = random(2, 20);
  const mode = random(0, 2) as GMMode;

  gm = generateGM({
    players,
    mode,
    namespace: "@",
    title: "random"
  });

  console.log(gm);

  palette = Palette.colors(players);
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
      renderer.faces = gm.faces;
      renderer.palette = palette;
      renderer.setup();
      renderer.render();
    } else {
      renderer = new Renderer(this._canvas, gm.faces, palette);
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
