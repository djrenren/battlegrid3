import "./drop-preview";

class BattleMap extends HTMLElement {
    #root: ShadowRoot;
    #img: HTMLImageElement;
    #canvas: HTMLCanvasElement;

    constructor() {
        super();
        this.#root = this.attachShadow({ mode: 'open' });
        this.#canvas = document.createElement('canvas');
        this.#canvas.style.position = 'absolute';
        this.#root.appendChild(this.#canvas);

        this.#img = new Image();
        this.#img.src = this.getAttribute('src') || '';
        this.#img.onload = this.#render;
        this.#img.style.display = "block";
        this.#img.style.pointerEvents = "none";
        this.#root.appendChild(this.#img);
        this.#render();
        this.style.position = 'relative';
        this.style.display = 'inline-block';
        this.addEventListener('dragover', e => {
            const preview = document.createElement('drop-preview');
            preview.style.position = 'absolute';
            const gridSize = parseFloat(this.getAttribute('grid-size')!);

            preview.style.left = Math.floor(e.offsetX / gridSize) * gridSize + 'px';
            preview.style.top = Math.floor(e.offsetY / gridSize) * gridSize + 'px';
            preview.style.width = this.getAttribute('grid-size') + 'px';
            preview.style.height = this.getAttribute('grid-size') + 'px';
            this.#root.appendChild(preview);
        }, );
        this.#root.addEventListener('token-drop', ev => {
            console.log("DROPPPPPPPPPP", ev);
        })
    }

    static observedAttributes = ['src', 'grid-size'];

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'src') this.#img.src = newValue
        else { this.#render(); }
    }

    #render = () => {
        const grid_size = parseFloat(this.getAttribute('grid-size') || '1');
        this.#canvas.width = this.#img.naturalWidth;
        this.#canvas.height = this.#img.naturalHeight;

        let ctx = this.#canvas.getContext('2d')!;
        // ctx.drawImage(this.#img, 0, 0);
        for (let x = 0; x < this.#canvas.width; x += grid_size) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, this.#canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < this.#canvas.height; y += grid_size) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(this.#canvas.width, y);
            ctx.stroke();
        }
    }
}

customElements.define('battle-map', BattleMap);