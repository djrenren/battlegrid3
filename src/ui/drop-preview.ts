import { CustomEvent } from "../util";

const css = new CSSStyleSheet();
css.replaceSync(`
    :host {
        opacity: 0;
        transition: opacity 0.2s;
        background-color: gray;
    }

    :host(.hover) {
        opacity: 0.5;
    }
`)

class DropPreview extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' }).adoptedStyleSheets = [css];
        this.addEventListener('transitionend', this.#cleanup)
        this.addEventListener('drop', this.#drop);
    }

    connectedCallback() {
        this.classList.add('hover');
        // this.addEventListener('dragenter', this.#uninit);
        this.addEventListener('dragover', (ev) => {
            ev.stopPropagation();
            ev.stopImmediatePropagation();
            this.classList.add('hover')
        });
        document.addEventListener('dragover', this.#uninit, {capture: true});
        document.addEventListener('pointermove', () => (this.classList.remove('hover')), {once: true, capture: true});
    }

    #uninit = (ev: Event) => {
        ev.composedPath()[0] !== this && this.classList.remove('hover');
    }

    #cleanup = () => {
        this.classList.contains('hover') || this.remove();
    }

    #drop = (ev: DragEvent) => {
        console.log([...(ev.dataTransfer?.items ?? [])].map(i => i.type));
        console.log(ev.dataTransfer?.getData('text/uri-list'));
        console.log(ev.dataTransfer?.getData('text/x-moz-url'));
        console.log(ev.dataTransfer?.getData('text/html'));
        console.log("dispatching");
        this.dispatchEvent(new TokenDropEvent({x: ev.offsetX, y: ev.offsetY}));
        this.remove();
    }
}


const TokenDropEvent = CustomEvent<{x: number, y: number}>('token-drop');

declare global {
    interface GlobalEventHandlersEventMap {
        "token-drop": typeof TokenDropEvent;
    }
}

customElements.define('drop-preview', DropPreview);