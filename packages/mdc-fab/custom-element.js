import { MDCRipple } from "@material/ripple/component";
import {
  installClassNameChangeHook,
  uninstallClassNameChangeHook,
} from "@material/utils/className";

class MdcFab extends HTMLElement {
  constructor() {
    super();
    this.handleKeydown_;
  }

  connectedCallback() {
    installClassNameChangeHook.call(this);
    this.ripple_ = new MDCRipple(this);
    this.handleKeydown_ = this.handleKeydown.bind(this);
    this.addEventListener("keydown", this.handleKeydown_);
  }

  disconnectedCallback() {
    this.ripple_.destroy();
    uninstallClassNameChangeHook.call(this);
    this.removeEventListener("keydown", this.handleKeydown_);
  }

  handleKeydown(event) {
    const isSpace = event.key === "Space" || event.keyCode == 32;
    const isEnter = event.key === "Enter" || event.keyCode == 12;
    if (isSpace || isEnter) {
      this.click();
      event.preventDefault();
    }
  }
}

customElements.define("mdc-fab", MdcFab);
