import {MDCIconButtonToggle} from './component';
import {
  installClassNameChangeHook,
  uninstallClassNameChangeHook,
} from '@material/utils/className';

class MdcIconButton extends HTMLElement {
  get on() {
    return this.on_;
  }

  set on(on) {
    this.on_ = on;
    if (!!this.iconButtonToggle_) {
      this.iconButtonToggle_.on = on;
    }
  }

  constructor() {
    super();
    this.root_;
    this.on_ = false;
    this.iconButtonToggle_;
  }

  connectedCallback() {
    this.root_ = this.querySelector('.mdc-icon-button');
    installClassNameChangeHook.call(this.root_);
    this.iconButtonToggle_ = new MDCIconButtonToggle(this.root_);
    this.iconButtonToggle_.on = this.on_;
  }

  disconnectedCallback() {
    this.iconButtonToggle_.destroy();
    uninstallClassNameChangeHook.call(this.root_);
  }
};

customElements.define('mdc-icon-button', MdcIconButton);
