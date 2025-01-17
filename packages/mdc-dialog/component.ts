/**
 * @license
 * Copyright 2017 Google Inc.
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
import {FocusTrap} from 'focus-trap';
import {closest, matches} from '@material/dom/ponyfill';
import {MDCDialogAdapter} from './adapter';
import {MDCDialogFoundation} from './foundation';
import {MDCDialogCloseEventDetail} from './types';
import * as util from './util';
import {MDCDialogFocusTrapFactory} from './util';

const {strings} = MDCDialogFoundation;

export class MDCDialog extends MDCComponent<MDCDialogFoundation> {
  get isOpen() {
    return this.foundation.isOpen();
  }

  get escapeKeyAction() {
    return this.foundation.getEscapeKeyAction();
  }

  set escapeKeyAction(action) {
    this.foundation.setEscapeKeyAction(action);
  }

  get scrimClickAction() {
    return this.foundation.getScrimClickAction();
  }

  set scrimClickAction(action) {
    this.foundation.setScrimClickAction(action);
  }

  get autoStackButtons() {
    return this.foundation.getAutoStackButtons();
  }

  set autoStackButtons(autoStack) {
    this.foundation.setAutoStackButtons(autoStack);
  }

  static attachTo(root: Element) {
    return new MDCDialog(root);
  }

  private buttons!: HTMLElement[];           // assigned in initialize()
  private container!: HTMLElement;           // assigned in initialize()
  private content!: HTMLElement|null;        // assigned in initialize()
  private defaultButton!: HTMLElement|null;  // assigned in initialize()

  private focusTrap!: FocusTrap;  // assigned in initialSyncWithDOM()
  private focusTrapFactory?:
      MDCDialogFocusTrapFactory;  // assigned in initialize()

  private handleClick!:
      SpecificEventListener<'click'>;  // assigned in initialSyncWithDOM()
  private handleKeydown!:
      SpecificEventListener<'keydown'>;  // assigned in initialSyncWithDOM()
  private handleDocumentKeydown!:
      SpecificEventListener<'keydown'>;   // assigned in initialSyncWithDOM()
  private handleOpening!: EventListener;  // assigned in initialSyncWithDOM()
  private handleClosing!: () => void;     // assigned in initialSyncWithDOM()

  initialize(
      focusTrapFactory?: MDCDialogFocusTrapFactory,
  ) {
    const container =
        this.root.querySelector<HTMLElement>(strings.CONTAINER_SELECTOR);
    if (!container) {
      throw new Error(`Dialog component requires a ${strings.CONTAINER_SELECTOR} container element`);
    }
    this.container = container;
    this.content =
        this.root.querySelector<HTMLElement>(strings.CONTENT_SELECTOR);
    this.buttons = [].slice.call(
        this.root.querySelectorAll<HTMLElement>(strings.BUTTON_SELECTOR));
    this.defaultButton = this.root.querySelector<HTMLElement>(
        `[${strings.BUTTON_DEFAULT_ATTRIBUTE}]`);
    this.focusTrapFactory = focusTrapFactory;
  }

  initialSyncWithDOM() {
    this.focusTrap = util.createFocusTrapInstance(
        this.container, this.focusTrapFactory,
        this.getInitialFocusEl() || undefined);

    this.handleClick = this.handleClick_.bind(this);
    this.handleKeydown = this.foundation.handleKeydown.bind(this.foundation);
    this.handleDocumentKeydown = this.handleDocumentKeydown_.bind(this);
    // this.handleLayout = this.layout.bind(this);

    this.handleOpening = () => {
      document.addEventListener('keydown', this.handleDocumentKeydown);
    };
    this.handleClosing = () => {
      document.removeEventListener('keydown', this.handleDocumentKeydown);
    };

    this.listen('click', this.handleClick);
    this.listen('keydown', this.handleKeydown);
    this.listen(strings.OPENING_EVENT, this.handleOpening);
    this.listen(strings.CLOSING_EVENT, this.handleClosing);
  }

  handleClick_(evt: MouseEvent) {
    const isScrim =
        this.eventTargetMatches(evt.target, strings.SCRIM_SELECTOR);
    // Check for scrim click first since it doesn't require querying ancestors.
    if (isScrim && this.foundation.getScrimClickAction() !== '') {
      this.close(this.scrimClickAction);
      this.emit("MDCDialog:close", {});
    }
  }

  eventTargetMatches(target: EventTarget | null, selector: string) {
    return target ? matches(target as Element, selector) : false;
  }

  handleDocumentKeydown_(evt: KeyboardEvent) {
    const isEscape = evt.key === 'Escape' || evt.keyCode === 27;
    if (isEscape) {
      this.emit("MDCDialog:close", {});
    }
  }

  destroy() {
    this.unlisten('click', this.handleClick);
    this.unlisten('keydown', this.handleKeydown);
    this.unlisten(strings.OPENING_EVENT, this.handleOpening);
    this.unlisten(strings.CLOSING_EVENT, this.handleClosing);
    this.handleClosing();

    super.destroy();
  }

  layout() {
    this.foundation.layout();
  }

  open() {
    this.foundation.open();
  }

  close(action = '') {
    this.foundation.close(action);
  }

  getDefaultFoundation() {
    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    const adapter: MDCDialogAdapter = {
      addBodyClass: (className) => document.body.classList.add(className),
      addClass: (className) => this.root.classList.add(className),
      areButtonsStacked: () => util.areTopsMisaligned(this.buttons),
      clickDefaultButton: () => {
        if (this.defaultButton) {
          this.defaultButton.click();
        }
      },
      eventTargetMatches: (target, selector) =>
          target ? matches(target as Element, selector) : false,
      getActionFromEvent: (evt: Event) => {
        if (!evt.target) {
          return '';
        }
        const element = closest(evt.target as Element, `[${strings.ACTION_ATTRIBUTE}]`);
        return element && element.getAttribute(strings.ACTION_ATTRIBUTE);
      },
      getInitialFocusEl: () => this.getInitialFocusEl(),
      hasClass: (className) => this.root.classList.contains(className),
      isContentScrollable: () => util.isScrollable(this.content),
      notifyClosed: (action) => this.emit<MDCDialogCloseEventDetail>(
          strings.CLOSED_EVENT, action ? {action} : {}),
      notifyClosing: (action) => this.emit<MDCDialogCloseEventDetail>(
          strings.CLOSING_EVENT, action ? {action} : {}),
      notifyOpened: () => this.emit(strings.OPENED_EVENT, {}),
      notifyOpening: () => this.emit(strings.OPENING_EVENT, {}),
      releaseFocus: () => {
        this.focusTrap.deactivate();
      },
      removeBodyClass: (className) => document.body.classList.remove(className),
      removeClass: (className) => this.root.classList.remove(className),
      reverseButtons: () => {
        this.buttons.reverse();
        this.buttons.forEach((button) => {
          button.parentElement!.appendChild(button);
        });
      },
      trapFocus: () => {
        this.focusTrap.activate();
      },
      registerContentEventHandler: (evt, handler) => {
        if (this.content instanceof HTMLElement) {
          this.content.addEventListener(evt, handler);
        }
      },
      deregisterContentEventHandler: (evt, handler) => {
        if (this.content instanceof HTMLElement) {
          this.content.removeEventListener(evt, handler);
        }
      },
      isScrollableContentAtTop: () => {
        return util.isScrollAtTop(this.content);
      },
      isScrollableContentAtBottom: () => {
        return util.isScrollAtBottom(this.content);
      },
      registerWindowEventHandler: (evt, handler) => {
        window.addEventListener(evt, handler);
      },
      deregisterWindowEventHandler: (evt, handler) => {
        window.removeEventListener(evt, handler);
      },
    };
    return new MDCDialogFoundation(adapter);
  }

  private getInitialFocusEl(): HTMLElement|null {
    return this.root.querySelector(`[${strings.INITIAL_FOCUS_ATTRIBUTE}]`);
  }
}
