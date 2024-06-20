import { LitElement } from "lit";
import { customElement } from "lit/decorators/custom-element.js";

/** Implements a drop zone for files */
@customElement("drop-zone")
class DropZone extends HTMLElement {
  connectedCallback(): void {
    this.style.setProperty("display", "inline-block");
    this.style.setProperty("max-width", "fit-content");
    this.style.setProperty("max-height", "fit-content");
    this.addEventListener("dragover", (e) => {
      this.setAttribute("drag", "");
      this.style.setProperty("--drag-x", e.offsetX + "px");
      this.style.setProperty("--drag-y", e.offsetY + "px");
    });
    const clear = (ev: Event) => {
      console.log(ev.type);
      this.removeAttribute("drag");
      this.style.removeProperty("--drag-x");
      this.style.removeProperty("--drag-y");
    };
    this.addEventListener("dragleave", clear);
    this.addEventListener("dragend", clear);
    this.addEventListener("drop", clear);
  }
}
