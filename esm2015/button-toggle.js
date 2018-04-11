/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusMonitor } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChildren, Directive, ElementRef, EventEmitter, forwardRef, Input, Optional, Output, ViewChild, ViewEncapsulation, NgModule } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { mixinDisabled, mixinDisableRipple, MatCommonModule, MatRippleModule } from '@angular/material/core';
import { SelectionModel } from '@angular/cdk/collections';

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
/**
 * \@docs-private
 */
class MatButtonToggleGroupBase {
}
const /** @type {?} */ _MatButtonToggleGroupMixinBase = mixinDisabled(MatButtonToggleGroupBase);
/**
 * Provider Expression that allows mat-button-toggle-group to register as a ControlValueAccessor.
 * This allows it to support [(ngModel)].
 * \@docs-private
 */
const /** @type {?} */ MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR = {
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MatButtonToggleGroup),
    multi: true
};
/**
 * @deprecated Use `MatButtonToggleGroup` instead.
 * \@deletion-target 7.0.0
 */
class MatButtonToggleGroupMultiple {
}
let /** @type {?} */ _uniqueIdCounter = 0;
/**
 * Change event object emitted by MatButtonToggle.
 */
class MatButtonToggleChange {
    /**
     * @param {?} source
     * @param {?} value
     */
    constructor(source, value) {
        this.source = source;
        this.value = value;
    }
}
/**
 * Exclusive selection button toggle group that behaves like a radio-button group.
 */
class MatButtonToggleGroup extends _MatButtonToggleGroupMixinBase {
    /**
     * @param {?} _changeDetector
     */
    constructor(_changeDetector) {
        super();
        this._changeDetector = _changeDetector;
        this._vertical = false;
        this._multiple = false;
        /**
         * The method to be called in order to update ngModel.
         * Now `ngModel` binding is not supported in multiple selection mode.
         */
        this._controlValueAccessorChangeFn = () => { };
        /**
         * onTouch function registered via registerOnTouch (ControlValueAccessor).
         */
        this._onTouched = () => { };
        this._name = `mat-button-toggle-group-${_uniqueIdCounter++}`;
        /**
         * Event that emits whenever the value of the group changes.
         * Used to facilitate two-way data binding.
         * \@docs-private
         */
        this.valueChange = new EventEmitter();
        /**
         * Event emitted when the group's value changes.
         */
        this.change = new EventEmitter();
    }
    /**
     * `name` attribute for the underlying `input` element.
     * @return {?}
     */
    get name() { return this._name; }
    /**
     * @param {?} value
     * @return {?}
     */
    set name(value) {
        this._name = value;
        if (this._buttonToggles) {
            this._buttonToggles.forEach(toggle => toggle.name = this._name);
        }
    }
    /**
     * Whether the toggle group is vertical.
     * @return {?}
     */
    get vertical() { return this._vertical; }
    /**
     * @param {?} value
     * @return {?}
     */
    set vertical(value) {
        this._vertical = coerceBooleanProperty(value);
    }
    /**
     * Value of the toggle group.
     * @return {?}
     */
    get value() {
        const /** @type {?} */ selected = this._selectionModel ? this._selectionModel.selected : [];
        if (this.multiple) {
            return selected.map(toggle => toggle.value);
        }
        return selected[0] ? selected[0].value : undefined;
    }
    /**
     * @param {?} newValue
     * @return {?}
     */
    set value(newValue) {
        this._setSelectionByValue(newValue);
        this.valueChange.emit(this.value);
    }
    /**
     * Selected button toggles in the group.
     * @return {?}
     */
    get selected() {
        const /** @type {?} */ selected = this._selectionModel.selected;
        return this.multiple ? selected : (selected[0] || null);
    }
    /**
     * Whether multiple button toggles can be selected.
     * @return {?}
     */
    get multiple() { return this._multiple; }
    /**
     * @param {?} value
     * @return {?}
     */
    set multiple(value) {
        this._multiple = coerceBooleanProperty(value);
    }
    /**
     * @return {?}
     */
    ngOnInit() {
        this._selectionModel = new SelectionModel(this.multiple, undefined, false);
    }
    /**
     * @return {?}
     */
    ngAfterContentInit() {
        this._selectionModel.select(...this._buttonToggles.filter(toggle => toggle.checked));
        this._tempValue = undefined;
    }
    /**
     * Sets the model value. Implemented as part of ControlValueAccessor.
     * @param {?} value Value to be set to the model.
     * @return {?}
     */
    writeValue(value) {
        this.value = value;
        this._changeDetector.markForCheck();
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnChange(fn) {
        this._controlValueAccessorChangeFn = fn;
    }
    /**
     * @param {?} fn
     * @return {?}
     */
    registerOnTouched(fn) {
        this._onTouched = fn;
    }
    /**
     * @param {?} isDisabled
     * @return {?}
     */
    setDisabledState(isDisabled) {
        this.disabled = isDisabled;
        if (this._buttonToggles) {
            this._buttonToggles.forEach(toggle => toggle._markForCheck());
        }
    }
    /**
     * Dispatch change event with current selection and group value.
     * @return {?}
     */
    _emitChangeEvent() {
        const /** @type {?} */ selected = this.selected;
        const /** @type {?} */ source = Array.isArray(selected) ? selected[selected.length - 1] : selected;
        const /** @type {?} */ event = new MatButtonToggleChange(/** @type {?} */ ((source)), this.value);
        this._controlValueAccessorChangeFn(event.value);
        this.change.emit(event);
    }
    /**
     * Syncs a button toggle's selected state with the model value.
     * @param {?} toggle Toggle to be synced.
     * @param {?} select Whether the toggle should be selected.
     * @param {?=} isUserInput Whether the change was a result of a user interaction.
     * @return {?}
     */
    _syncButtonToggle(toggle, select, isUserInput = false) {
        // Deselect the currently-selected toggle, if we're in single-selection
        // mode and the button being toggled isn't selected at the moment.
        if (!this.multiple && this.selected && !toggle.checked) {
            (/** @type {?} */ (this.selected)).checked = false;
        }
        if (select) {
            this._selectionModel.select(toggle);
        }
        else {
            this._selectionModel.deselect(toggle);
        }
        // Only emit the change event for user input.
        if (isUserInput) {
            this._emitChangeEvent();
        }
        // Note: we emit this one no matter whether it was a user interaction, because
        // it is used by Angular to sync up the two-way data binding.
        this.valueChange.emit(this.value);
    }
    /**
     * Checks whether a button toggle is selected.
     * @param {?} toggle
     * @return {?}
     */
    _isSelected(toggle) {
        return this._selectionModel.isSelected(toggle);
    }
    /**
     * Determines whether a button toggle should be checked on init.
     * @param {?} toggle
     * @return {?}
     */
    _isPrechecked(toggle) {
        if (typeof this._tempValue === 'undefined') {
            return false;
        }
        if (this.multiple && Array.isArray(this._tempValue)) {
            return !!this._tempValue.find(value => toggle.value != null && value === toggle.value);
        }
        return toggle.value === this._tempValue;
    }
    /**
     * Updates the selection state of the toggles in the group based on a value.
     * @param {?} value
     * @return {?}
     */
    _setSelectionByValue(value) {
        // If the toggles haven't been initialized yet, save the value for later.
        if (!this._buttonToggles) {
            this._tempValue = value;
            return;
        }
        if (this.multiple && value) {
            if (!Array.isArray(value)) {
                throw Error('Value must be an array in multiple-selection mode.');
            }
            this._clearSelection();
            value.forEach((currentValue) => this._selectValue(currentValue));
        }
        else {
            this._clearSelection();
            this._selectValue(value);
        }
    }
    /**
     * Clears the selected toggles.
     * @return {?}
     */
    _clearSelection() {
        this._selectionModel.clear();
        this._buttonToggles.forEach(toggle => toggle.checked = false);
    }
    /**
     * Selects a value if there's a toggle that corresponds to it.
     * @param {?} value
     * @return {?}
     */
    _selectValue(value) {
        const /** @type {?} */ correspondingOption = this._buttonToggles.find(toggle => {
            return toggle.value != null && toggle.value === value;
        });
        if (correspondingOption) {
            correspondingOption.checked = true;
            this._selectionModel.select(correspondingOption);
        }
    }
}
MatButtonToggleGroup.decorators = [
    { type: Directive, args: [{
                selector: 'mat-button-toggle-group',
                providers: [
                    MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR,
                    { provide: MatButtonToggleGroupMultiple, useExisting: MatButtonToggleGroup },
                ],
                inputs: ['disabled'],
                host: {
                    '[attr.role]': 'multiple ? "group" : "radiogroup"',
                    'class': 'mat-button-toggle-group',
                    '[class.mat-button-toggle-vertical]': 'vertical'
                },
                exportAs: 'matButtonToggleGroup',
            },] },
];
/** @nocollapse */
MatButtonToggleGroup.ctorParameters = () => [
    { type: ChangeDetectorRef, },
];
MatButtonToggleGroup.propDecorators = {
    "_buttonToggles": [{ type: ContentChildren, args: [forwardRef(() => MatButtonToggle),] },],
    "name": [{ type: Input },],
    "vertical": [{ type: Input },],
    "value": [{ type: Input },],
    "valueChange": [{ type: Output },],
    "multiple": [{ type: Input },],
    "change": [{ type: Output },],
};
/**
 * \@docs-private
 */
class MatButtonToggleBase {
}
const /** @type {?} */ _MatButtonToggleMixinBase = mixinDisableRipple(MatButtonToggleBase);
/**
 * Single button inside of a toggle group.
 */
class MatButtonToggle extends _MatButtonToggleMixinBase {
    /**
     * @param {?} toggleGroup
     * @param {?} _changeDetectorRef
     * @param {?} _elementRef
     * @param {?} _focusMonitor
     */
    constructor(toggleGroup, _changeDetectorRef, _elementRef, _focusMonitor) {
        super();
        this._changeDetectorRef = _changeDetectorRef;
        this._elementRef = _elementRef;
        this._focusMonitor = _focusMonitor;
        this._isSingleSelector = false;
        this._checked = false;
        /**
         * Users can specify the `aria-labelledby` attribute which will be forwarded to the input element
         */
        this.ariaLabelledby = null;
        this._disabled = false;
        /**
         * Event emitted when the group value changes.
         */
        this.change = new EventEmitter();
        this.buttonToggleGroup = toggleGroup;
    }
    /**
     * Unique ID for the underlying `input` element.
     * @return {?}
     */
    get inputId() { return `${this.id}-input`; }
    /**
     * Whether the button is checked.
     * @return {?}
     */
    get checked() {
        return this.buttonToggleGroup ? this.buttonToggleGroup._isSelected(this) : this._checked;
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set checked(value) {
        const /** @type {?} */ newValue = coerceBooleanProperty(value);
        if (newValue !== this._checked) {
            this._checked = newValue;
            if (this.buttonToggleGroup) {
                this.buttonToggleGroup._syncButtonToggle(this, this._checked);
            }
            this._changeDetectorRef.markForCheck();
        }
    }
    /**
     * Whether the button is disabled.
     * @return {?}
     */
    get disabled() {
        return this._disabled || (this.buttonToggleGroup && this.buttonToggleGroup.disabled);
    }
    /**
     * @param {?} value
     * @return {?}
     */
    set disabled(value) { this._disabled = coerceBooleanProperty(value); }
    /**
     * @return {?}
     */
    ngOnInit() {
        this._isSingleSelector = this.buttonToggleGroup && !this.buttonToggleGroup.multiple;
        this._type = this._isSingleSelector ? 'radio' : 'checkbox';
        this.id = this.id || `mat-button-toggle-${_uniqueIdCounter++}`;
        if (this._isSingleSelector) {
            this.name = this.buttonToggleGroup.name;
        }
        if (this.buttonToggleGroup && this.buttonToggleGroup._isPrechecked(this)) {
            this.checked = true;
        }
        this._focusMonitor.monitor(this._elementRef.nativeElement, true);
    }
    /**
     * Focuses the button.
     * @return {?}
     */
    focus() {
        this._inputElement.nativeElement.focus();
    }
    /**
     * Checks the button toggle due to an interaction with the underlying native input.
     * @param {?} event
     * @return {?}
     */
    _onInputChange(event) {
        event.stopPropagation();
        this._checked = this._isSingleSelector ? true : !this._checked;
        if (this.buttonToggleGroup) {
            this.buttonToggleGroup._syncButtonToggle(this, this._checked, true);
            this.buttonToggleGroup._onTouched();
        }
        // Emit a change event when the native input does.
        this.change.emit(new MatButtonToggleChange(this, this.value));
    }
    /**
     * @param {?} event
     * @return {?}
     */
    _onInputClick(event) {
        // We have to stop propagation for click events on the visual hidden input element.
        // By default, when a user clicks on a label element, a generated click event will be
        // dispatched on the associated input element. Since we are using a label element as our
        // root container, the click event on the `slide-toggle` will be executed twice.
        // The real click event will bubble up, and the generated click event also tries to bubble up.
        // This will lead to multiple click events.
        // Preventing bubbling for the second event will solve that issue.
        event.stopPropagation();
    }
    /**
     * Marks the button toggle as needing checking for change detection.
     * This method is exposed because the parent button toggle group will directly
     * update bound properties of the radio button.
     * @return {?}
     */
    _markForCheck() {
        // When the group value changes, the button will not be notified.
        // Use `markForCheck` to explicit update button toggle's status.
        this._changeDetectorRef.markForCheck();
    }
}
MatButtonToggle.decorators = [
    { type: Component, args: [{selector: 'mat-button-toggle',
                template: "<label [attr.for]=\"inputId\" class=\"mat-button-toggle-label\" #label><input #input class=\"mat-button-toggle-input cdk-visually-hidden\" [type]=\"_type\" [id]=\"inputId\" [checked]=\"checked\" [disabled]=\"disabled || null\" [attr.name]=\"name\" [attr.aria-label]=\"ariaLabel\" [attr.aria-labelledby]=\"ariaLabelledby\" (change)=\"_onInputChange($event)\" (click)=\"_onInputClick($event)\"><div class=\"mat-button-toggle-label-content\"><ng-content></ng-content></div></label><div class=\"mat-button-toggle-focus-overlay\"></div><div class=\"mat-button-toggle-ripple\" matRipple [matRippleTrigger]=\"label\" [matRippleDisabled]=\"this.disableRipple || this.disabled\"></div>",
                styles: [".mat-button-toggle-group,.mat-button-toggle-standalone{box-shadow:0 3px 1px -2px rgba(0,0,0,.2),0 2px 2px 0 rgba(0,0,0,.14),0 1px 5px 0 rgba(0,0,0,.12);position:relative;display:inline-flex;flex-direction:row;border-radius:2px;cursor:pointer;white-space:nowrap;overflow:hidden}.mat-button-toggle-vertical{flex-direction:column}.mat-button-toggle-vertical .mat-button-toggle-label-content{display:block}.mat-button-toggle-disabled .mat-button-toggle-label-content{cursor:default}.mat-button-toggle{white-space:nowrap;position:relative}.mat-button-toggle.cdk-keyboard-focused .mat-button-toggle-focus-overlay{opacity:1}.mat-button-toggle-label-content{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;display:inline-block;line-height:36px;padding:0 16px;cursor:pointer}.mat-button-toggle-label-content>*{vertical-align:middle}.mat-button-toggle-focus-overlay{border-radius:inherit;pointer-events:none;opacity:0;top:0;left:0;right:0;bottom:0;position:absolute}.mat-button-toggle-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}"],
                encapsulation: ViewEncapsulation.None,
                exportAs: 'matButtonToggle',
                changeDetection: ChangeDetectionStrategy.OnPush,
                inputs: ['disableRipple'],
                host: {
                    '[class.mat-button-toggle-standalone]': '!buttonToggleGroup',
                    '[class.mat-button-toggle-checked]': 'checked',
                    '[class.mat-button-toggle-disabled]': 'disabled',
                    'class': 'mat-button-toggle',
                    '[attr.id]': 'id',
                }
            },] },
];
/** @nocollapse */
MatButtonToggle.ctorParameters = () => [
    { type: MatButtonToggleGroup, decorators: [{ type: Optional },] },
    { type: ChangeDetectorRef, },
    { type: ElementRef, },
    { type: FocusMonitor, },
];
MatButtonToggle.propDecorators = {
    "ariaLabel": [{ type: Input, args: ['aria-label',] },],
    "ariaLabelledby": [{ type: Input, args: ['aria-labelledby',] },],
    "_inputElement": [{ type: ViewChild, args: ['input',] },],
    "id": [{ type: Input },],
    "name": [{ type: Input },],
    "value": [{ type: Input },],
    "checked": [{ type: Input },],
    "disabled": [{ type: Input },],
    "change": [{ type: Output },],
};

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */
class MatButtonToggleModule {
}
MatButtonToggleModule.decorators = [
    { type: NgModule, args: [{
                imports: [MatCommonModule, MatRippleModule],
                exports: [MatCommonModule, MatButtonToggleGroup, MatButtonToggle],
                declarations: [MatButtonToggleGroup, MatButtonToggle],
            },] },
];

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes} checked by tsc
 */

export { MatButtonToggleGroupBase, _MatButtonToggleGroupMixinBase, MAT_BUTTON_TOGGLE_GROUP_VALUE_ACCESSOR, MatButtonToggleGroupMultiple, MatButtonToggleChange, MatButtonToggleGroup, MatButtonToggleBase, _MatButtonToggleMixinBase, MatButtonToggle, MatButtonToggleModule };
//# sourceMappingURL=button-toggle.js.map
