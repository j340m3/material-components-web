import { MDCTab } from "./component";
import {
  installClassNameChangeHook,
  uninstallClassNameChangeHook,
} from "@material/utils/className";

let tabIdCounter = 0;

class MdcTab extends HTMLElement {
  constructor() {
    super();
    this.init_ = false;
    this.tab_;
    this.handleKeydown_ = this.handleKeydown.bind(this);
  }

  connectedCallback() {
    this.init();
    this.tabIndex = 0;
  }

  init() {
    if (this.init_) return;
    this.init_ = true;
    installClassNameChangeHook.call(this);
    this.id = this.id || `mdc-tab-${++tabIdCounter}`;
    this.tab_ = new MDCTab(this);
    this.addEventListener("keydown", this.handleKeydown_);
  }

  disconnectedCallback() {
    this.removeEventListener("keydown", this.handleKeydown_);
    this.tab_.destroy();
    uninstallClassNameChangeHook.call(this);
  }

  handleKeydown(event) {
    if (event.key === "Space" || event.keyCode == 32) {
      event.preventDefault();
    }
  }
}

customElements.define("mdc-tab", MdcTab);
