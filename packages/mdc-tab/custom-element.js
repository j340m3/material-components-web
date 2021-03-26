import {MDCTab} from './component';
import {
  installClassNameChangeHook,
  uninstallClassNameChangeHook,
} from '@material/utils/className';

let tabIdCounter = 0;

class MdcTab extends HTMLElement {
  constructor() {
    super();
    this.instantiated_ = false;
    this.tab_;
  }

  connectedCallback() {
    this.instantiate();
  }

  instantiate() {
    if (this.instantiated_) return;
    installClassNameChangeHook.call(this);
    this.tab_ = new MDCTab(this);
    this.id = this.id || `mdc-tab-${++tabIdCounter}`;
    this.instantiated_ = true;
  }

  disconnectedCallback() {
    this.tab_.destroy();
    uninstallClassNameChangeHook.call(this);
  }
};

customElements.define('mdc-tab', MdcTab);
