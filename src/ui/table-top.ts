import { LitElement, css, html } from "lit";
import { customElement } from "lit/decorators.js";
import * as D from "../data/tabletop.js";
import "./view-port/view-port.js";
import "./battle-map.js";
import "./drop-zone.js";
import material from "../styles/material.js";
import { Map } from "yjs";
import { IndexeddbPersistence } from "y-indexeddb";

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
    let grid = this.tabletop.get("grid")!;
    if (!grid) return null;
    return html`
      <view-port>
        <battle-map src=${grid.get("src")} grid-size=${grid.get("grid_size")}></battle-map>
      </view-port>
      <button class="reset" @click=${this.#reset}>Reset</button>
    `;
  }

  firstOpenDialog() {
    let grid = this.tabletop.get("grid")!;
    if (grid) return null;
    return html`
      <drop-zone @drop=${this.mapdrop}>
        <dialog open class="paper">Drop a map to get get started</dialog>
      </drop-zone>
    `;
  }

  render() {
    return html` ${this.mapIfDefined()} ${this.firstOpenDialog()} `;
  }

  //#region event handlers

  /** Sets the first map */
  async mapdrop(e: DragEvent) {
    let url = e.dataTransfer?.getData("text/uri-list").split("\n")[0]!;
    console.log(this.tabletop);
    this.tabletop.set(
      "grid",
      new Map([
        ["src", url],
        ["grid_size", 35],
      ]) as D.Grid,
    );
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
            box-shadow: 0 0 20px rgba(0, 0, 0, 0.5);
            border-radius: 10px;
            overflow: hidden;
        }

        dialog {
            position: unset;
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