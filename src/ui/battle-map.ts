import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ref, createRef, type Ref } from "lit/directives/ref.js";
import { styleMap } from "lit/directives/style-map.js";

/** Implements a battle map with render lines and a drop preview */
@customElement("battle-map")
class BattleMap extends LitElement {
  /** The image to render as the background */
  @property()
  src: string = "";

  /** The size of the grid-lines */
  @property({ attribute: "grid-size", type: Number })
  grid_size: number = 32;

  /** The canvas we render the lines on */
  #canvas: Ref<HTMLCanvasElement> = createRef();

  @property({ attribute: false })
  hover: { x: number; y: number } | null = null;

  render() {
    console.log("RENDERING", this.hover);
    return html`
      <style>
        .drop-preview {
          --grid-size: ${this.grid_size + "px"};
        }
      </style>
      <img src=${this.src} @load=${this.#onload} />
      <drop-zone operation="copy">
        <div class="drop-preview"></div>
        <canvas ${ref(this.#canvas)}></canvas>
      </drop-zone>
    `;
  }

  static styles = css`
    :host {
      position: relative;
      display: inline-block;
      @starting-style {
        scale: 0.75;
        opacity: 0;
      }

      opacity: 1;
      scale: 1;
      transition:
        opacity 0.5s,
        scale 0.5s;
    }

    img {
      display: block;
      margin: 0;
    }

    canvas {
      pointer-events: none;
    }

    .drop-preview {
      position: absolute;
      background: #000;
      display: none;
      width: var(--grid-size);
      height: var(--grid-size);
      pointer-events: none;
    }

    drop-zone {
      position: absolute;
      inset: 0;
      display: block;
    }

    drop-zone[drag] .drop-preview {
      display: block;
      left: round(down, var(--drag-x), var(--grid-size));
      top: round(down, var(--drag-y), var(--grid-size));
    }
  `;

  #onload = (ev: Event) => {
    const t = ev.target as HTMLImageElement;
    const c = this.#canvas.value!;
    const w = t.naturalWidth;
    const h = t.naturalHeight;
    c.width = w;
    c.height = h;

    const ctx = c.getContext("2d")!;
    ctx.strokeStyle = "white";
    for (let x = this.grid_size; x < w; x += this.grid_size) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, c.height);
      ctx.stroke();
    }
    for (let y = this.grid_size; y < h; y += this.grid_size) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(c.width, y);
      ctx.stroke();
    }
  };
}
