import template from "./view-port.include.html";
import css from "./view-port.include.css";

// Load the HTML template
const templateElement = document.createElement("template");
templateElement.innerHTML = template;

// Load the stylesheet
const styleSheet = new CSSStyleSheet();
styleSheet.replaceSync(css);

export class ViewPort extends HTMLElement {
  #root = this.attachShadow({ mode: "closed" });
  // TODO replace with this.computedStyleMap when supported by firefox: https://bugzilla.mozilla.org/show_bug.cgi?id=1857849
  #computedStyles = getComputedStyle(this);
  #content: HTMLDivElement;

  constructor() {
    super();
    this.#root.adoptedStyleSheets = [styleSheet];
    this.#root.appendChild(templateElement.content.cloneNode(true));
    this.#content = this.#root.querySelector("#transform")!;
    this.#resizeObserver.observe(this);
    this.#resizeObserver.observe(this.#content);
    document.addEventListener("keydown", this.#keyboard);
    this.addEventListener("pointerdown", this.#pointerDown);
    this.addEventListener("pointermove", this.#pointerMove);
    this.addEventListener("pointerup", this.#pointerUp);
    this.addEventListener("pointercancel", this.#pointerUp);
  }

  connectedCallback() {
    document.addEventListener("wheel", this.#wheel, { passive: false });
    document.addEventListener("keydown", this.#keyboard);
  }

  disconnectedCallback() {
    document.removeEventListener("wheel", this.#wheel);
    document.removeEventListener("keydown", this.#keyboard);
  }

  #resizeObserver = new ResizeObserver((entries) => {
    console.log("RESIZE");
    for (let e of entries) {
      if (e.target === this) {
        const is_centered = this.#is_centered();
        this.style.setProperty("--vw", e.contentRect.width + "");
        this.style.setProperty("--vh", e.contentRect.height + "");
        if (is_centered) {
          this.#zoom_to_fit();
        }
      } else {
        this.style.setProperty("--cw", e.contentRect.width + "");
        this.style.setProperty("--ch", e.contentRect.height + "");
        this.#zoom_to_fit();
      }
    }
  });

  // INTERACTIVITY
  #wheel = (event: WheelEvent) => {
    this.#clearAnimations();
    const x = parseFloat(this.#computedStyles.getPropertyValue("--x"));
    const y = parseFloat(this.#computedStyles.getPropertyValue("--y"));
    if (event.ctrlKey) {
      const scale = parseFloat(this.#computedStyles.getPropertyValue("--scale"));

      // Firefox scrolls by lines, chrome scrolls by pixels, there's no formal
      // definition of what a "line" is, but let's just say it's 10 px
      const multiplier = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 10 : 1;

      // Don't let any weird inputs cause a jump of more than 50px / 5 lines
      const delta = -event.deltaY * multiplier;

      const inc = delta * 0.01 * scale;
      const newX = (event.clientX + x) /* + vlocx */ / (scale / inc) + x;
      const newY = (event.clientY + y) /* + vlocx */ / (scale / inc) + y;
      const newScale = scale + inc;
      this.style.setProperty("--x", newX);
      this.style.setProperty("--y", newY);
      this.style.setProperty("--scale", newScale);
    } else {
      this.style.setProperty("--x", x + event.deltaX);
      this.style.setProperty("--y", y + event.deltaY);
    }
  };

  #center_params = (margin: number = 100) => {
    const getProp = (prop: string) => parseFloat(this.#computedStyles.getPropertyValue(prop));
    let [vw, vh, cw, ch] = ["--vw", "--vh", "--cw", "--ch"].map(getProp);

    const scale = Math.min((vw - margin) / cw, (vh - margin) / ch);

    const x = (vw - cw * scale) / -2;
    const y = (vh - ch * scale) / -2;
    return { scale, x, y };
  };

  #is_centered = (margin: number = 100) => {
    let [x, y, scale] = ["--x", "--y", "--scale"].map((prop) =>
      parseFloat(this.#computedStyles.getPropertyValue(prop)),
    );
    let center = this.#center_params(margin);
    return center.x === x && center.y === y && center.scale === scale;
  };

  #zoom_to_fit = (margin: number = 100) => {
    const { scale, x, y } = this.#center_params(margin);
    this.style.setProperty("--scale", scale);
    this.style.setProperty("--x", x);
    this.style.setProperty("--y", y);
  };

  #animations = false;
  animate(...args: Parameters<HTMLElement["animate"]>): Animation {
    console.log("animating!");
    this.#animations = true;
    return super.animate(...args);
  }

  #clearAnimations = () => {
    this.#animations &&
      this.getAnimations().forEach((a) => a.currentTime !== null && (a.commitStyles(), a.cancel()));
    this.#animations = false;
  };

  // Flag that an animation has been run.
  #keyboard = (event: KeyboardEvent) => {
    console.log("KEYBOARD!");
    let direction: [number, number];

    switch (event.code) {
      case "ArrowUp":
        direction = [0, -1];
        break;
      case "ArrowDown":
        direction = [0, 1];
        break;
      case "ArrowLeft":
        direction = [-1, 0];
        break;
      case "ArrowRight":
        direction = [1, 0];
        break;
      case "Digit0":
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const params = this.#center_params();

          this.animate(
            [
              {
                "--x": parseFloat(this.#computedStyles.getPropertyValue("--x")),
                "--y": parseFloat(this.#computedStyles.getPropertyValue("--y")),
                "--scale": parseFloat(this.#computedStyles.getPropertyValue("--scale")),
              },
              {
                "--x": params.x,
                "--y": params.y,
                "--scale": params.scale,
              },
            ],
            {
              duration: 200,
              easing: "ease-out",
              composite: "replace",
            },
          ).finished.then((a) => (a.commitStyles(), a.cancel()));
          return this.#zoom_to_fit();
        }
      default:
        console.log(event.code);
        return;
    }
    this.animate(
      [
        {
          "--x": 200 * direction[0],
          "--y": 200 * direction[1],
        },
      ],
      {
        duration: 150,
        fill: "forwards",
        composite: "accumulate",
      },
    ).finished.then((a) => (a.commitStyles(), a.cancel()));
  };

  #pointerDown = (event: PointerEvent) => {
    // TODO: switch to pressure when safari is fixed
    if (!event.isPrimary || (event.buttons !== 1 && event.pointerType !== "touch")) return;
    event.preventDefault();
    event.stopPropagation();
    this.setPointerCapture(event.pointerId);
    this.classList.add("grabbing");
  };
  #pointerMove = (event: PointerEvent) => {
    // TODO: switch to pressure when safari is fixed
    if (!event.isPrimary || (event.buttons !== 1 && event.pointerType !== "touch")) return;
    event.preventDefault();
    event.stopPropagation();
    const x = parseFloat(this.#computedStyles.getPropertyValue("--x"));
    const y = parseFloat(this.#computedStyles.getPropertyValue("--y"));
    this.style.setProperty("--x", x - event.movementX);
    this.style.setProperty("--y", y - event.movementY);
  };
  #pointerUp = (event: PointerEvent) => {
    if (!event.isPrimary) return;
    this.releasePointerCapture(event.pointerId);
    this.classList.remove("grabbing");
  };
}

customElements.define("view-port", ViewPort);
