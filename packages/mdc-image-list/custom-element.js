import { MDCRipple } from "@material/ripple/component";
import {
  installClassNameChangeHook,
  uninstallClassNameChangeHook,
} from "@material/utils/className";

class MdcImageList extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
  }

  disconnectedCallback() {
  }
};

customElements.define("mdc-image-list", MdcImageList);

class MdcImageListItem extends HTMLElement {
  constructor() {
    super();
    this.ripple_;
  }

  connectedCallback() {
    installClassNameChangeHook.call(this);
    const rippleSurfaceElement = this.querySelector(".mdc-ripple-surface");
    if (!!rippleSurfaceElement) {
      this.ripple_ = new MDCRipple(rippleSurfaceElement);
    }
  }

  disconnectedCallback() {
    if (!!this.ripple_) {
      this.ripple_.destroy();
    }
    uninstallClassNameChangeHook.call(this);
  }
};

customElements.define("mdc-image-list-item", MdcImageListItem);
