/**
 * @license
 * Copyright 2016 Google Inc.
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
import {announce} from '@material/dom/announce';
import {MDCChip} from '../chip/component';
import {MDCChipFoundation} from '../chip/foundation';
import {MDCChipInteractionEvent, MDCChipNavigationEvent, MDCChipRemovalEvent,
    MDCChipSelectionEvent} from '../chip/types';
import {MDCChipSetAdapter} from './adapter';
import {MDCChipSetFoundation} from './foundation';

const {INTERACTION_EVENT, SELECTION_EVENT, REMOVAL_EVENT, NAVIGATION_EVENT} = MDCChipFoundation.strings;

export class MDCChipSet extends MDCComponent<MDCChipSetFoundation> {
  static attachTo(root: Element) {
    return new MDCChipSet(root);
  }

  get chips(): ReadonlyArray<MDCChip> {
    return this.chips_.slice();
  }

  /**
   * @return An array of the IDs of all selected chips.
   */
  get selectedChipIds(): ReadonlyArray<string> {
    return this.foundation.getSelectedChipIds();
  }

  private chips_!: MDCChip[]; // assigned in initialize()
  private chipFactory_!: (el: Element) => MDCChip; // assigned in initialize()
  private handleChipInteraction_!: (evt: MDCChipInteractionEvent) => void; // assigned in initialSyncWithDOM()
  private handleChipSelection_!: (evt: MDCChipSelectionEvent) => void; // assigned in initialSyncWithDOM()
  private handleChipRemoval_!: (evt: MDCChipRemovalEvent) => void; // assigned in initialSyncWithDOM()
  private handleChipNavigation_!: (evt: MDCChipNavigationEvent) => void; // assigned in initialSyncWithDOM()

  /**
   * @param chipFactory A function which creates a new MDCChip.
   */
  initialize() {
    this.chipFactory_ = (el: any) => {
      return el.chip_;
    };
    this.chips_ = [];
  }

  initialSyncWithDOM() {
    this.chips_.forEach((chip) => {
      if (chip.id && chip.selected) {
        this.foundation.select(chip.id);
      }
    });

    this.handleChipInteraction_ = (evt) =>
        this.foundation.handleChipInteraction(evt.detail);
    this.handleChipSelection_ = (evt) =>
        this.foundation.handleChipSelection(evt.detail);
    this.handleChipRemoval_ = (evt) =>
        this.foundation.handleChipRemoval(evt.detail);
    this.handleChipNavigation_ = (evt) =>
        this.foundation.handleChipNavigation(evt.detail);
    this.listen(INTERACTION_EVENT, this.handleChipInteraction_);
    this.listen(SELECTION_EVENT, this.handleChipSelection_);
    this.listen(NAVIGATION_EVENT, this.handleChipNavigation_);
  }

  destroy() {
    this.chips_.forEach((chip) => {
      chip.destroy();
    });

    this.unlisten(INTERACTION_EVENT, this.handleChipInteraction_);
    this.unlisten(SELECTION_EVENT, this.handleChipSelection_);
    this.unlisten(REMOVAL_EVENT, this.handleChipRemoval_);
    this.unlisten(NAVIGATION_EVENT, this.handleChipNavigation_);

    super.destroy();
  }

  /**
   * Adds a new chip object to the chip set from the given chip element.
   */
  addChip(chipEl: Element) {
    this.chips_.push(this.chipFactory_(chipEl));
    if (this.chips_.length === 1) {
      this.chips_[0].makePrimaryActionFocusable();
    }
  }

  getDefaultFoundation() {
    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    const adapter: MDCChipSetAdapter = {
      announceMessage: (message) => {
        announce(message);
      },
      focusChipPrimaryActionAtIndex: (index) => {
        this.chips_[index].focusPrimaryAction();
      },
      focusChipTrailingActionAtIndex: (index) => {
        this.chips_[index].focusTrailingAction();
      },
      getChipListCount: () => this.chips_.length,
      getIndexOfChipById: (chipId) => {
        return this.findChipIndex_(chipId);
      },
      hasClass: (className) => this.root.classList.contains(className),
      isRTL: () => window.getComputedStyle(this.root).getPropertyValue(
                       'direction') === 'rtl',
      removeChipAtIndex: (index) => {
        if (index >= 0 && index < this.chips_.length) {
          this.chips_.splice(index, 1);
          if (
            this.chips_.length > 0
            && !this.chips_.some((chip) => chip.isPrimaryActionFocusable())
          ) {
            this.chips_[Math.max(0, index - 1)].makePrimaryActionFocusable();
          }
        }
      },
      removeFocusFromChipAtIndex: (index) => {
        this.chips_[index].removeFocus();
      },
      selectChipAtIndex: (index, selected, shouldNotifyClients) => {
        if (index >= 0 && index < this.chips_.length) {
          this.chips_[index].setSelectedFromChipSet(selected, shouldNotifyClients);
        }
      },
    };
    return new MDCChipSetFoundation(adapter);
  }

  /**
   * Returns the index of the chip with the given id, or -1 if the chip does not exist.
   */
  private findChipIndex_(chipId: string): number {
    for (let i = 0; i < this.chips_.length; i++) {
      if (this.chips_[i].id === chipId) {
        return i;
      }
    }
    return -1;
  }
}
