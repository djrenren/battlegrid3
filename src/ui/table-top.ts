import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import * as D from "../data/tabletop.js";
import "./view-port/view-port.js";
import "./battle-map.js";
import "./util/drop-zone.js";
import material from "../styles/material.js";
import { Map } from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";
import { getUrl } from "./util/drop-zone.js";

@customElement("table-top")
class Tabletop extends LitElement {
  doc: D.TabletopDoc = D.createTabletopDoc();
  get tabletop() {
    return this.doc.getMap("tabletop")!;
  }

  constructor() {
    super();
    const provider = new IndexeddbPersistence("session", this.doc);
    this.doc.on("update", () => this.requestUpdate());
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.doc.on("update", () => this.requestUpdate());
  }

  mapIfDefined() {
    const grid = this.tabletop.get("grid")!;
    if (!grid) return null;
    return html`
      <view-port>
        <battle-map src=${grid.get("src")} grid-size=${grid.get("grid_size")}></battle-map>
      </view-port>
      <button class="reset" @click=${this.#reset}>Reset</button>
    `;
  }

  firstOpenDialog() {
    const grid = this.tabletop.get("grid")!;
    if (grid) return null;
    return html`
      <drop-zone @drop=${this.mapdrop} operation="copy">
        <div class="drop-message">Drop a map to get get started</div>
      </drop-zone>
    `;
  }

  render() {
    return html` ${this.mapIfDefined()} ${this.firstOpenDialog()} `;
  }

  //#region event handlers

  /** Sets the first map */
  async mapdrop(e: DragEvent) {
    const url = getUrl(e.dataTransfer!)!;
    console.log(url);
    const data = D.yjs({
      src: url,
      grid_size: 35,
      tokens: [] as D.Token[],
    });
    this.tabletop.set("grid", data);
    e.stopPropagation();
  }

  /** Clears the existing tabletop */
  #reset() {
    this.tabletop.clear();
  }

  //#endregion event handlers

  static styles = [
    material,
    css`
        :host {
            display: grid;
            align-items: center;
            justify-items: center;
            grid-template: 1fr / 1fr;
            background: #f2f2f2;
        }

        .reset {
            position: fixed;
            top: 0;
            left; 0;
        }

        battle-map {
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            overflow: hidden;
        }

        dialog {
            position: unset;
        }

        drop-zone {
            justify-self: stretch;
            align-self: stretch;
            display: flex;
            justify-content: center;
            align-items: center;
        }

        .drop-message {
            font-weight: bold;
            font-size: 2em;
            color: darkgray;
            padding: 1em;
            border-radius: 1em;
            transition: all 0.5s;
            border: 5px solid transparent;
        }

        drop-zone[drag] > .drop-message {
            border-color: cornflowerblue;
            background: Highlight;
            color: cornflowerblue;
        }

        drop-zone[drag] dialog {
            background: green;
        }

        view-port {
            width: 100%;
            height: 100%;
        }
    `,
  ];
}
