import { MDCDialog } from "./component";
import {
  installClassNameChangeHook,
  uninstallClassNameChangeHook,
} from "@material/utils/className";

class MdcDialog extends HTMLElement {
  get open() {
    return this.open_;
  }

  set open(open) {
    this.open_ = open;
    if (!!this.dialog_) {
      if (open) {
        this.dialog_.open();
      } else {
        this.dialog_.close();
      }
    }
  }

  get scrimClickAction() {
    return this.scrimClickAction_;
  }

  set scrimClickAction(scrimClickAction) {
    this.scrimClickAction_ = scrimClickAction;
    if (!!this.dialog_) {
      this.dialog_.scrimClickAction = scrimClickAction_;
    }
  }

  get escapeKeyAction() {
    return this.escapeKeyAction_;
  }

  set escapeKeyAction(escapeKeyAction) {
    this.escapeKeyAction_ = escapeKeyAction;
    if (!!this.dialog_) {
      this.dialog_.escapeKeyAction = escapeKeyAction_;
    }
  }

  constructor() {
    super();
    this.open_ = false;
    this.scrimClickAction_ = "close";
    this.escapeKeyAction_ = "close";
  }

  connectedCallback() {
    installClassNameChangeHook.call(this);
    this.dialog_ = new MDCDialog(this);
    this.dialog_.scrimClickAction = this.scrimClickAction_;
    this.dialog_.escapeKeyAction = this.escapeKeyAction_;
    if (this.open_) {
      this.dialog_.open();
    }
  }

  disconnectedCallback() {
    this.dialog_.destroy();
    uninstallClassNameChangeHook.call(this);
  }
}

customElements.define("mdc-dialog", MdcDialog);
