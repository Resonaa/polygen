import { LitElement, css, html } from "lit";
import { customElement, property , query} from "lit/decorators.js";
import {Map} from "~/game/map";
import { generateMap } from "~/game/generator/common";
import _ from "lodash";
import { Palette } from "./game/gm/palette";
import RendererNew from "./game/view/rendererNew";

let renderer, map, palette;

function generate() {
  const players = _.random(2, 20);
  const mode = _.sample(Object.values(Map.Mode))!;

  map = generateMap({
    players,
    mode,
    namespace: "@",
    title: "random"
  });

  palette = Palette.colors(players);
}

@customElement("map-viewer")
export class MapViewer extends LitElement {
  @query("canvas")
  _canvas: HTMLCanvasElement;

  render() {
    return html`
      <div class="box">
        <div>
          <canvas></canvas>
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
      renderer.map = map;
      renderer.palette = palette;
      renderer.setup();
      renderer.render();
    } else {
      renderer = new RendererNew(this._canvas, map, palette);
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
      width: 80vw;
      height: 80vh;
    }
  `;
}

declare global {
  interface HTMLElementTagNameMap {
    "map-viewer": MapViewer;
  }
}
