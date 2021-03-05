import { MDCList } from "./component";
import { MDCRipple } from "@material/ripple/component";
import {
  installClassNameChangeHook,
  uninstallClassNameChangeHook,
} from "@material/utils/className";

class MdcList extends HTMLElement {
  focus() {
    let selectedIndex = this.list_.foundation.getSelectedIndex();
    if (typeof selectedIndex !== "number") {
      selectedIndex = selectedIndex.length > 0 ? selectedIndex[0] : -1;
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
    if (this.list_) {
      this.list_.selectedIndex = selectedIndex;

      const previousIndex =
        previousSelectedIndex.length > 0 ? previousSelectedIndex[0] : -1;

      if (previousIndex !== -1 && this.list_.listElements[previousIndex]) {
        this.list_.listElements[previousIndex].setAttribute("tabindex", "-1");
      }

      if (
        selectedIndex.length > 0 &&
        this.list_.listElements.length > selectedIndex[0]
      ) {
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
    if (this.list_) {
      this.list_.vertical = vertical;
    }
  }

  get wrapFocus() {
    return this.wrapFocus_;
  }

  set wrapFocus(wrapFocus) {
    this.wrapFocus_ = wrapFocus;
    if (this.list_) {
      this.list_.wrapFocus = wrapFocus;
    }
  }

  get interactive() {
    return this.interactive_;
  }

  set interactive(interactive) {
    const oldInteractive = this.interactive_;
    this.interactive_ = interactive;
    if (oldInteractive !== interactive && this.init_) {
      if (this.interactive_) {
        this.initInteractive();
      } else {
        this.deinitInteractive();
      }
    }
  }

  constructor() {
    super();
    this.init_ = false;
    this.selectedIndex_ = -1;
    this.wrapFocus_ = false;
    this.vertical_ = true;
    this.interactive_ = false;
    this.list_;
  }

  connectedCallback() {
    this.init();
  }

  init() {
    if (this.init_) return;
    this.init_ = true;
    this.style.display = "block";
    this.style.pointerEvents = "none";
    installClassNameChangeHook.call(this);
    if (this.interactive_) {
      this.initInteractive();
    }
  }

  initInteractive() {
    if (this.list_) return;
    this.style.pointerEvents = "auto";
    this.list_ = new MDCList(this);
    this.list_.selectedIndex = this.selectedIndex_;
    this.list_.vertical = this.vertical_;
    this.list_.wrapFocus = this.wrapFocus_;

    const firstSelectedListItem = this.querySelector(
      ".mdc-deprecated-list-item--selected, .mdc-deprecated-list-item--activated"
    );
    if (firstSelectedListItem) {
      firstSelectedListItem.setAttribute("tabindex", 0);
    } else {
      const firstListItem = this.querySelector(".mdc-deprecated-list-item");
      if (firstListItem) {
        firstListItem.setAttribute("tabindex", 0);
      }
    }
  }

  deinitInteractive() {
    if (!this.list_) return;
    this.style.pointerEvents = "none";
    this.list_.destroy();
    delete this.list_;
  }

  disconnectedCallback() {
    this.deinitInteractive();
    uninstallClassNameChangeHook.call(this);
  }
}

customElements.define("mdc-list", MdcList);

class MdcListItem extends HTMLElement {
  constructor() {
    super();
    this.ripples_ = false;
    this.init_ = false;
    this.ripple_;
  }

  set ripples(ripples) {
    const oldRipples = this.ripples_;
    this.ripples_ = ripples;
    if (oldRipples !== this.ripples_ && this.init_) {
      if (this.ripples_) {
        this.initRipple();
      } else {
        this.dinitRipple();
      }
    }
  }

  get ripples() {
    return this.ripples_;
  }

  connectedCallback() {
    this.init();
  }

  init() {
    if (this.init_) return;
    this.init_ = true;
    installClassNameChangeHook.call(this.listItemElement);
    if (this.ripples_) {
      this.initRipple();
    }
  }

  get listItemElement() {
    return this.classList.contains("mdc-deprecated-list-item")
      ? this
      : this.querySelector(".mdc-deprecated-list-item");
  }

  initRipple() {
    if (this.ripple_) return;
    this.ripple_ = new MDCRipple(this.listItemElement);
  }

  disconnectedCallback() {
    this.deinitRipple();
    uninstallClassNameChangeHook.call(this.listItemElement);
  }

  deinitRipple() {
    if (!this.ripple_) return;
    this.ripple_.destroy();
    delete this.ripple_;
  }
}

customElements.define("mdc-list-item", MdcListItem);
