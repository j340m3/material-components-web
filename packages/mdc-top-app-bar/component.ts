/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {MDCComponent} from '@material/base/component';
import {SpecificEventListener} from '@material/base/types';
import {MDCTopAppBarAdapter} from './adapter';
import {cssClasses, strings} from './constants';
import {MDCFixedTopAppBarFoundation} from './fixed/foundation';
import {MDCTopAppBarBaseFoundation} from './foundation';
import {MDCShortTopAppBarFoundation} from './short/foundation';
import {MDCTopAppBarFoundation} from './standard/foundation';

export class MDCTopAppBar extends MDCComponent<MDCTopAppBarBaseFoundation> {
  static attachTo(root: Element): MDCTopAppBar {
    return new MDCTopAppBar(root);
  }

  private handleNavigationClick_!: SpecificEventListener<'click'>; // assigned in initialSyncWithDOM()
  private handleWindowResize_!: SpecificEventListener<'resize'>; // assigned in initialSyncWithDOM()
  private handleTargetScroll_!: SpecificEventListener<'scroll'>; // assigned in initialSyncWithDOM()
  private navIcon_!: Element | null;
  private scrollTarget_!: EventTarget;

  initialize() {
    this.navIcon_ = this.root.querySelector(strings.NAVIGATION_ICON_SELECTOR);
    this.scrollTarget_ = window;
  }

  initialSyncWithDOM() {
    this.handleNavigationClick_ =
        this.foundation.handleNavigationClick.bind(this.foundation);
    this.handleWindowResize_ =
        this.foundation.handleWindowResize.bind(this.foundation);
    this.handleTargetScroll_ =
        this.foundation.handleTargetScroll.bind(this.foundation);

    this.scrollTarget_.addEventListener('scroll', this.handleTargetScroll_ as EventListener);

    if (this.navIcon_) {
      this.navIcon_.addEventListener('click', this.handleNavigationClick_ as EventListener);
    }

    const isFixed = this.root.classList.contains(cssClasses.FIXED_CLASS);
    const isShort = this.root.classList.contains(cssClasses.SHORT_CLASS);
    if (!isShort && !isFixed) {
      window.addEventListener('resize', this.handleWindowResize_ as EventListener);
    }
  }

  destroy() {
    this.scrollTarget_.removeEventListener('scroll', this.handleTargetScroll_ as EventListener);
    if (this.navIcon_) {
      this.navIcon_.removeEventListener('click', this.handleNavigationClick_ as EventListener);
    }
    const isFixed = this.root.classList.contains(cssClasses.FIXED_CLASS);
    const isShort = this.root.classList.contains(cssClasses.SHORT_CLASS);
    if (!isShort && !isFixed) {
      window.removeEventListener('resize', this.handleWindowResize_ as EventListener);
    }
    super.destroy();
  }

  setScrollTarget(target: EventTarget) {
    // Remove scroll handler from the previous scroll target
    this.scrollTarget_.removeEventListener('scroll', this.handleTargetScroll_ as EventListener);

    this.scrollTarget_ = target;

    // Initialize scroll handler on the new scroll target
    this.handleTargetScroll_ =
        this.foundation.handleTargetScroll.bind(this.foundation);
    this.scrollTarget_.addEventListener('scroll', this.handleTargetScroll_ as EventListener);
  }

  getDefaultFoundation() {
    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
    const adapter: MDCTopAppBarAdapter = {
      hasClass: (className) => this.root.classList.contains(className),
      addClass: (className) => this.root.classList.add(className),
      removeClass: (className) => this.root.classList.remove(className),
      setStyle: (property, value) =>
          (this.root as HTMLElement).style.setProperty(property, value),
      getTopAppBarHeight: () => this.root.clientHeight,
      notifyNavigationIconClicked: () =>
          this.emit(strings.NAVIGATION_EVENT, {}),
      getViewportScrollY: () => {
        const win = this.scrollTarget_ as Window;
        const el = this.scrollTarget_ as Element;
        return win.pageYOffset !== undefined ? win.pageYOffset : el.scrollTop;
      },
      getTotalActionItems: () =>
          this.root.querySelectorAll(strings.ACTION_ITEM_SELECTOR).length,
    };
    // tslint:enable:object-literal-sort-keys

    let foundation: MDCTopAppBarBaseFoundation;
    if (this.root.classList.contains(cssClasses.SHORT_CLASS)) {
      foundation = new MDCShortTopAppBarFoundation(adapter);
    } else if (this.root.classList.contains(cssClasses.FIXED_CLASS)) {
      foundation = new MDCFixedTopAppBarFoundation(adapter);
    } else {
      foundation = new MDCTopAppBarFoundation(adapter);
    }

    return foundation;
  }
}
