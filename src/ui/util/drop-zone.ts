import { customElement } from "lit/decorators/custom-element.js";
import { store } from "../../data/casl.js";
// import { CASL } from "../index.js";

/**
 * A simple drop-zone element that tracks drop-state in CSS and sets the dropEffect.
 *
 * To determine the drop-effect, use the `operation` attribute. Like so:
 *
 * ```html
 *  <drop-zone operation="copy">
 *  </drop-zone>
 * ```
 *
 * During a drag over, the drop-zone will set the `--drag-x` and `--drag-y` CSS variables,
 * as well as the `drag` attribute. This enables use cases like:
 *
 * ```html
 * <drop-zone>
 *  <style>
 *    hint {
 *      display: none;
 *    }
 *    drop-zone[drag] > .hint {
 *     display: block;
 *     position: absolute;
 *     inset: var(--drag-y) 0 0 var(--drag-x);
 *    }
 *  </style>
 *  <div class="hint"></div>
 * </drop-zone>
 * ```
 */
@customElement("drop-zone")
class DropZone extends HTMLElement {
  operation?: DataTransfer["dropEffect"];
  observedAttributes = ["operation"];
  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === "operation") {
      this.operation = newValue as DataTransfer["dropEffect"];
    }
  }
  connectedCallback(): void {
    this.operation = this.getAttribute("operation") as DataTransfer["dropEffect"] | undefined;
    this.addEventListener("dragover", (e) => {
      this.setAttribute("drag", "");
      this.style.setProperty("--drag-x", e.offsetX + "px");
      this.style.setProperty("--drag-y", e.offsetY + "px");
      if (e.dataTransfer && this.operation) {
        e.dataTransfer.dropEffect = this.operation;
      }
    });
    const clear = (ev: Event) => {
      this.removeAttribute("drag");
      this.style.removeProperty("--drag-x");
      this.style.removeProperty("--drag-y");
    };
    this.addEventListener("dragleave", clear);
    this.addEventListener("dragend", clear);
    this.addEventListener("drop", clear);
  }
}

/**
 * Extracts a URL from a DataTransfer object.
 * @param d The data transfer object
 * @returns The extracted URL
 */
export async function getUrl(d: DataTransfer): Promise<string | undefined> {
  // We prefer to fetch images from the HTML data, as opposed to url-list
  // because it's more likely to be a direct link to the image, as opposed to
  // a link to a page containing the image.

  const file = d.files[0];
  if (file) {
    return await store(file);
  }

  const html = d.getData("text/html");
  const doc = new DOMParser().parseFromString(html, "text/html");
  const url = doc.querySelector("img")?.src;
  return url;
}
