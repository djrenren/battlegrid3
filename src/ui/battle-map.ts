import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import {ref, createRef, type Ref} from 'lit/directives/ref.js';
import { styleMap } from "lit/directives/style-map.js";

/** Implements a battle map with render lines and a drop preview */
@customElement('battle-map')
class BattleMap extends LitElement {
    /** The image to render as the background */
    @property()
    src: string = "";

    /** The size of the grid-lines */
    @property({attribute: 'grid-size', type: Number})
    grid_size: number = 32;

    /** The canvas we render the lines on */
    #canvas: Ref<HTMLCanvasElement> = createRef();

    @property({attribute: false})
    hover: {x: number, y: number} | null = null;

    render() {
        console.log("RENDERING", this.hover);
        return html`
            <canvas ${ref(this.#canvas)}></canvas>
            <img src=${this.src} @load=${this.#onload} />
            ${this.hover ?
                html`<div class="drop-preview" style=${styleMap({
                    left: Math.floor(this.hover.x / this.grid_size) * this.grid_size + 'px',
                    top: Math.floor(this.hover.y / this.grid_size) * this.grid_size + 'px',
                    width: this.grid_size + 'px',
                    height: this.grid_size + 'px',
                })}></div>` :
                null
            }
        `;
    }

    static styles = css`
        :host {
            position: relative;
            display: inline-block;
        }

        img {
            display: block;
            pointer-events: none;
        }

        canvas {
            position: absolute;
        }
        .drop-preview {
            position: absolute;
            background: #000;
        }
    `;

    connectedCallback(): void {
        super.connectedCallback();

        this.addEventListener('dragover', e => {
            this.hover = {x: e.offsetX, y: e.offsetY};
        });
        const clear = () => {
            this.hover = null;
        };
        this.addEventListener('dragend', clear);
        this.addEventListener('dragleave', clear);
        this.addEventListener('drop', clear);
        this.addEventListener('token-drop', ev => {
            console.log("DROPPPPPPPPPP", ev);
        })
    }

    #onload = (ev: Event) => {
        const t = ev.target as HTMLImageElement;
        const c = this.#canvas.value!;
        console.log("c", c);
        c.width = t.naturalWidth;
        c.height = t.naturalHeight;
        let w = t.naturalWidth;
        let h = t.naturalHeight;

        console.log()
        let ctx = c.getContext('2d')!;
        // ctx.drawImage(this.#img, 0, 0);
        for (let x = 0; x < w; x += this.grid_size) {
            console.log("vert", x)
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, c.height);
            ctx.stroke();
        }
        for (let y = 0; y < h; y += this.grid_size) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(c.width, y);
            ctx.stroke();
        }
    }
}