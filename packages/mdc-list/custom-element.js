import { MDCList } from "./component";
import { MDCRipple } from "@material/ripple/component";
import {
  installClassNameChangeHook,
  uninstallClassNameChangeHook,
} from "@material/utils/className";

class MdcList extends HTMLElement {

  focus() {
    let selectedIndex = this.list_.foundation_.getSelectedIndex();
    if (typeof selectedIndex !== "number") {
      selectedIndex = (selectedIndex.length > 0) ? selectedIndex[0] : -1;
    }
    if (0 <= selectedIndex && selectedIndex < this.list_.listElements.length) {
      this.list_.listElements[selectedIndex].focus();
    } else if (this.list_.listElements.length > 0) {
      this.list_.listElements[0].focus();
    }
  }

  blur() {
    if (this.contains(document.activeElement)) {
      document.activeElement.blur();
    }
  }

  get selectedIndex() {
    return this.selectedIndex_;
  }

  set selectedIndex(selectedIndex) {
    const previousSelectedIndex = this.selectedIndex_;
    this.selectedIndex_ = selectedIndex;
    if (!!this.list_) {
      this.list_.selectedIndex = selectedIndex;

      let previousIndex = (previousSelectedIndex.length > 0)
        ? previousSelectedIndex[0]
        : -1;

      if ((previousIndex !== -1) && !!this.list_.listElements[previousIndex]) {
        this.list_.listElements[previousIndex].setAttribute("tabindex", "-1");
      }

      if (selectedIndex.length > 0 && this.list_.listElements.length > selectedIndex[0]) {
        this.list_.listElements[selectedIndex[0]].setAttribute("tabindex", "0");
      } else if (this.list_.listElements.length > 0) {
        this.list_.listElements[0].setAttribute("tabindex", "0");
      }
    }
  }

  get vertical() {
    return this.vertical_;
  }

  set vertical(vertical) {
    this.vertical_ = vertical;
    if (!!this.list_) {
      this.list_.vertical = vertical;
    }
  }

  get wrapFocus() {
    return this.wrapFocus_;
  }

  set wrapFocus(wrapFocus) {
    this.wrapFocus_ = wrapFocus;
    if (!!this.list_) {
      this.list_.wrapFocus = wrapFocus;
    }
  }

  constructor() {
    super();
    this.selectedIndex_ = -1;
    this.wrapFocus_ = false;
    this.vertical_ = true;
    this.list_;
  }

  connectedCallback() {
    this.style.display = "block";
    installClassNameChangeHook.call(this);
    this.list_ = new MDCList(this);
    this.list_.selectedIndex = this.selectedIndex_;
    this.list_.vertical = this.vertical_;
    this.list_.wrapFocus = this.wrapFocus_;

    const firstSelectedListItem =
      this.querySelector(".mdc-list-item--selected, .mdc-list-item--activated");
    if (!!firstSelectedListItem) {
      firstSelectedListItem.setAttribute("tabindex", 0);
    } else {
      const firstListItem = this.querySelector(".mdc-list-item");
      if (!!firstListItem) {
        firstListItem.setAttribute("tabindex", 0);
      }
    }

    const parentElement = this.parentElement;
    if (parentElement.classList.contains("mdc-menu")) {
      parentElement.listSetup(this);
    }
  }

  disconnectedCallback() {
    this.list_.destroy();
    uninstallClassNameChangeHook.call(this);
  }
};

customElements.define("mdc-list", MdcList);

class MdcListItem extends HTMLElement {

  constructor() {
    super();
  }

  connectedCallback() {
    installClassNameChangeHook.call(this);
    if (this.classList.contains("mdc-list-item")) {
      this.ripple_ = new MDCRipple(this);
    } else {
      this.ripple_ = new MDCRipple(this.querySelector(".mdc-list-item"));
    }
  }

  disconnectedCallback() {
    this.ripple_.destroy();
    uninstallClassNameChangeHook.call(this);
  }
};

customElements.define("mdc-list-item", MdcListItem);
