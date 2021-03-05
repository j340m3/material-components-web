import {MDCRipple} from '@material/ripple/component';
import {
  installClassNameChangeHook,
  uninstallClassNameChangeHook,
} from '@material/utils/className';

export default class MdcButton extends HTMLElement {
  constructor() {
    super();
    this.ripple_;
  }

  connectedCallback() {
    installClassNameChangeHook.call(this);
    this.ripple_ = new MDCRipple(this.querySelector('.mdc-button'));
  }

  disconnectedCallback() {
    this.ripple_.destroy();
    uninstallClassNameChangeHook.call(this);
  }
};

customElements.define('mdc-button', MdcButton);
