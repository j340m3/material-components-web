import { MDCSwitch } from "./component";
import {
  installClassNameChangeHook,
  uninstallClassNameChangeHook,
} from "@material/utils/className";

class MdcSwitch extends HTMLElement {

  focus() {
    this.switch_.nativeControl_.focus();
  }

  blur() {
    this.switch_.nativeControl_.blur();
  }

  get checked() {
    return this.checked_;
  }

  set checked(checked) {
    this.checked_ = checked;
    if (!!this.switch_) {
      this.switch_.checked = checked;
    }
  }

  get disabled() {
    return this.disabled_;
  }

  set disabled(disabled) {
    this.disabled_ = disabled;
    if (!!this.switch_) {
      this.switch_.disabled = disabled;
    }
  }

  constructor() {
    super();
    this.checked_ = false;
    this.disabled_ = false;
    this.switch_;
  }

  connectedCallback() {
    installClassNameChangeHook.call(this);
    this.switch_ = new MDCSwitch(this);
    this.switch_.checked = this.checked_;
    this.switch_.disabled = this.disabled_;
  }

  disconnectedCallback() {
    this.switch_.destroy();
    uninstallClassNameChangeHook.call(this);
  }
};

customElements.define("mdc-switch", MdcSwitch);
