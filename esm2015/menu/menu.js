/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { FocusKeyManager } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { ESCAPE, LEFT_ARROW, RIGHT_ARROW, DOWN_ARROW, UP_ARROW, HOME, END, hasModifierKey, } from '@angular/cdk/keycodes';
import { ChangeDetectionStrategy, Component, ContentChild, ContentChildren, Directive, ElementRef, EventEmitter, Inject, InjectionToken, Input, NgZone, Output, TemplateRef, QueryList, ViewChild, ViewEncapsulation, } from '@angular/core';
import { merge, Subject, Subscription } from 'rxjs';
import { startWith, switchMap, take } from 'rxjs/operators';
import { matMenuAnimations } from './menu-animations';
import { MatMenuContent } from './menu-content';
import { throwMatMenuInvalidPositionX, throwMatMenuInvalidPositionY } from './menu-errors';
import { MatMenuItem } from './menu-item';
import { MAT_MENU_PANEL } from './menu-panel';
/** Injection token to be used to override the default options for `mat-menu`. */
export const MAT_MENU_DEFAULT_OPTIONS = new InjectionToken('mat-menu-default-options', {
    providedIn: 'root',
    factory: MAT_MENU_DEFAULT_OPTIONS_FACTORY
});
/** @docs-private */
export function MAT_MENU_DEFAULT_OPTIONS_FACTORY() {
    return {
        overlapTrigger: false,
        xPosition: 'after',
        yPosition: 'below',
        backdropClass: 'cdk-overlay-transparent-backdrop',
    };
}
/**
 * Start elevation for the menu panel.
 * @docs-private
 */
const MAT_MENU_BASE_ELEVATION = 4;
let menuPanelUid = 0;
/** Base class with all of the `MatMenu` functionality. */
let _MatMenuBase = /** @class */ (() => {
    class _MatMenuBase {
        constructor(_elementRef, _ngZone, _defaultOptions) {
            this._elementRef = _elementRef;
            this._ngZone = _ngZone;
            this._defaultOptions = _defaultOptions;
            this._xPosition = this._defaultOptions.xPosition;
            this._yPosition = this._defaultOptions.yPosition;
            /** Only the direct descendant menu items. */
            this._directDescendantItems = new QueryList();
            /** Subscription to tab events on the menu panel */
            this._tabSubscription = Subscription.EMPTY;
            /** Config object to be passed into the menu's ngClass */
            this._classList = {};
            /** Current state of the panel animation. */
            this._panelAnimationState = 'void';
            /** Emits whenever an animation on the menu completes. */
            this._animationDone = new Subject();
            /** Class or list of classes to be added to the overlay panel. */
            this.overlayPanelClass = this._defaultOptions.overlayPanelClass || '';
            /** Class to be added to the backdrop element. */
            this.backdropClass = this._defaultOptions.backdropClass;
            this._overlapTrigger = this._defaultOptions.overlapTrigger;
            this._hasBackdrop = this._defaultOptions.hasBackdrop;
            /** Event emitted when the menu is closed. */
            this.closed = new EventEmitter();
            /**
             * Event emitted when the menu is closed.
             * @deprecated Switch to `closed` instead
             * @breaking-change 8.0.0
             */
            this.close = this.closed;
            this.panelId = `mat-menu-panel-${menuPanelUid++}`;
        }
        /** Position of the menu in the X axis. */
        get xPosition() { return this._xPosition; }
        set xPosition(value) {
            if (value !== 'before' && value !== 'after') {
                throwMatMenuInvalidPositionX();
            }
            this._xPosition = value;
            this.setPositionClasses();
        }
        /** Position of the menu in the Y axis. */
        get yPosition() { return this._yPosition; }
        set yPosition(value) {
            if (value !== 'above' && value !== 'below') {
                throwMatMenuInvalidPositionY();
            }
            this._yPosition = value;
            this.setPositionClasses();
        }
        /** Whether the menu should overlap its trigger. */
        get overlapTrigger() { return this._overlapTrigger; }
        set overlapTrigger(value) {
            this._overlapTrigger = coerceBooleanProperty(value);
        }
        /** Whether the menu has a backdrop. */
        get hasBackdrop() { return this._hasBackdrop; }
        set hasBackdrop(value) {
            this._hasBackdrop = coerceBooleanProperty(value);
        }
        /**
         * This method takes classes set on the host mat-menu element and applies them on the
         * menu template that displays in the overlay container.  Otherwise, it's difficult
         * to style the containing menu from outside the component.
         * @param classes list of class names
         */
        set panelClass(classes) {
            const previousPanelClass = this._previousPanelClass;
            if (previousPanelClass && previousPanelClass.length) {
                previousPanelClass.split(' ').forEach((className) => {
                    this._classList[className] = false;
                });
            }
            this._previousPanelClass = classes;
            if (classes && classes.length) {
                classes.split(' ').forEach((className) => {
                    this._classList[className] = true;
                });
                this._elementRef.nativeElement.className = '';
            }
        }
        /**
         * This method takes classes set on the host mat-menu element and applies them on the
         * menu template that displays in the overlay container.  Otherwise, it's difficult
         * to style the containing menu from outside the component.
         * @deprecated Use `panelClass` instead.
         * @breaking-change 8.0.0
         */
        get classList() { return this.panelClass; }
        set classList(classes) { this.panelClass = classes; }
        ngOnInit() {
            this.setPositionClasses();
        }
        ngAfterContentInit() {
            this._updateDirectDescendants();
            this._keyManager = new FocusKeyManager(this._directDescendantItems).withWrap().withTypeAhead();
            this._tabSubscription = this._keyManager.tabOut.subscribe(() => this.closed.emit('tab'));
            // If a user manually (programatically) focuses a menu item, we need to reflect that focus
            // change back to the key manager. Note that we don't need to unsubscribe here because _focused
            // is internal and we know that it gets completed on destroy.
            this._directDescendantItems.changes.pipe(startWith(this._directDescendantItems), switchMap(items => merge(...items.map((item) => item._focused)))).subscribe(focusedItem => this._keyManager.updateActiveItem(focusedItem));
        }
        ngOnDestroy() {
            this._directDescendantItems.destroy();
            this._tabSubscription.unsubscribe();
            this.closed.complete();
        }
        /** Stream that emits whenever the hovered menu item changes. */
        _hovered() {
            // Coerce the `changes` property because Angular types it as `Observable<any>`
            const itemChanges = this._directDescendantItems.changes;
            return itemChanges.pipe(startWith(this._directDescendantItems), switchMap(items => merge(...items.map((item) => item._hovered))));
        }
        /*
         * Registers a menu item with the menu.
         * @docs-private
         * @deprecated No longer being used. To be removed.
         * @breaking-change 9.0.0
         */
        addItem(_item) { }
        /**
         * Removes an item from the menu.
         * @docs-private
         * @deprecated No longer being used. To be removed.
         * @breaking-change 9.0.0
         */
        removeItem(_item) { }
        /** Handle a keyboard event from the menu, delegating to the appropriate action. */
        _handleKeydown(event) {
            const keyCode = event.keyCode;
            const manager = this._keyManager;
            switch (keyCode) {
                case ESCAPE:
                    if (!hasModifierKey(event)) {
                        event.preventDefault();
                        this.closed.emit('keydown');
                    }
                    break;
                case LEFT_ARROW:
                    if (this.parentMenu && this.direction === 'ltr') {
                        this.closed.emit('keydown');
                    }
                    break;
                case RIGHT_ARROW:
                    if (this.parentMenu && this.direction === 'rtl') {
                        this.closed.emit('keydown');
                    }
                    break;
                case HOME:
                case END:
                    if (!hasModifierKey(event)) {
                        keyCode === HOME ? manager.setFirstItemActive() : manager.setLastItemActive();
                        event.preventDefault();
                    }
                    break;
                default:
                    if (keyCode === UP_ARROW || keyCode === DOWN_ARROW) {
                        manager.setFocusOrigin('keyboard');
                    }
                    manager.onKeydown(event);
            }
        }
        /**
         * Focus the first item in the menu.
         * @param origin Action from which the focus originated. Used to set the correct styling.
         */
        focusFirstItem(origin = 'program') {
            // When the content is rendered lazily, it takes a bit before the items are inside the DOM.
            if (this.lazyContent) {
                this._ngZone.onStable.asObservable()
                    .pipe(take(1))
                    .subscribe(() => this._focusFirstItem(origin));
            }
            else {
                this._focusFirstItem(origin);
            }
        }
        /**
         * Actual implementation that focuses the first item. Needs to be separated
         * out so we don't repeat the same logic in the public `focusFirstItem` method.
         */
        _focusFirstItem(origin) {
            const manager = this._keyManager;
            manager.setFocusOrigin(origin).setFirstItemActive();
            // If there's no active item at this point, it means that all the items are disabled.
            // Move focus to the menu panel so keyboard events like Escape still work. Also this will
            // give _some_ feedback to screen readers.
            if (!manager.activeItem && this._directDescendantItems.length) {
                let element = this._directDescendantItems.first._getHostElement().parentElement;
                // Because the `mat-menu` is at the DOM insertion point, not inside the overlay, we don't
                // have a nice way of getting a hold of the menu panel. We can't use a `ViewChild` either
                // because the panel is inside an `ng-template`. We work around it by starting from one of
                // the items and walking up the DOM.
                while (element) {
                    if (element.getAttribute('role') === 'menu') {
                        element.focus();
                        break;
                    }
                    else {
                        element = element.parentElement;
                    }
                }
            }
        }
        /**
         * Resets the active item in the menu. This is used when the menu is opened, allowing
         * the user to start from the first option when pressing the down arrow.
         */
        resetActiveItem() {
            this._keyManager.setActiveItem(-1);
        }
        /**
         * Sets the menu panel elevation.
         * @param depth Number of parent menus that come before the menu.
         */
        setElevation(depth) {
            // The elevation starts at the base and increases by one for each level.
            // Capped at 24 because that's the maximum elevation defined in the Material design spec.
            const elevation = Math.min(MAT_MENU_BASE_ELEVATION + depth, 24);
            const newElevation = `mat-elevation-z${elevation}`;
            const customElevation = Object.keys(this._classList).find(c => c.startsWith('mat-elevation-z'));
            if (!customElevation || customElevation === this._previousElevation) {
                if (this._previousElevation) {
                    this._classList[this._previousElevation] = false;
                }
                this._classList[newElevation] = true;
                this._previousElevation = newElevation;
            }
        }
        /**
         * Adds classes to the menu panel based on its position. Can be used by
         * consumers to add specific styling based on the position.
         * @param posX Position of the menu along the x axis.
         * @param posY Position of the menu along the y axis.
         * @docs-private
         */
        setPositionClasses(posX = this.xPosition, posY = this.yPosition) {
            const classes = this._classList;
            classes['mat-menu-before'] = posX === 'before';
            classes['mat-menu-after'] = posX === 'after';
            classes['mat-menu-above'] = posY === 'above';
            classes['mat-menu-below'] = posY === 'below';
        }
        /** Starts the enter animation. */
        _startAnimation() {
            // @breaking-change 8.0.0 Combine with _resetAnimation.
            this._panelAnimationState = 'enter';
        }
        /** Resets the panel animation to its initial state. */
        _resetAnimation() {
            // @breaking-change 8.0.0 Combine with _startAnimation.
            this._panelAnimationState = 'void';
        }
        /** Callback that is invoked when the panel animation completes. */
        _onAnimationDone(event) {
            this._animationDone.next(event);
            this._isAnimating = false;
        }
        _onAnimationStart(event) {
            this._isAnimating = true;
            // Scroll the content element to the top as soon as the animation starts. This is necessary,
            // because we move focus to the first item while it's still being animated, which can throw
            // the browser off when it determines the scroll position. Alternatively we can move focus
            // when the animation is done, however moving focus asynchronously will interrupt screen
            // readers which are in the process of reading out the menu already. We take the `element`
            // from the `event` since we can't use a `ViewChild` to access the pane.
            if (event.toState === 'enter' && this._keyManager.activeItemIndex === 0) {
                event.element.scrollTop = 0;
            }
        }
        /**
         * Sets up a stream that will keep track of any newly-added menu items and will update the list
         * of direct descendants. We collect the descendants this way, because `_allItems` can include
         * items that are part of child menus, and using a custom way of registering items is unreliable
         * when it comes to maintaining the item order.
         */
        _updateDirectDescendants() {
            this._allItems.changes
                .pipe(startWith(this._allItems))
                .subscribe((items) => {
                this._directDescendantItems.reset(items.filter(item => item._parentMenu === this));
                this._directDescendantItems.notifyOnChanges();
            });
        }
    }
    _MatMenuBase.decorators = [
        { type: Directive }
    ];
    /** @nocollapse */
    _MatMenuBase.ctorParameters = () => [
        { type: ElementRef },
        { type: NgZone },
        { type: undefined, decorators: [{ type: Inject, args: [MAT_MENU_DEFAULT_OPTIONS,] }] }
    ];
    _MatMenuBase.propDecorators = {
        _allItems: [{ type: ContentChildren, args: [MatMenuItem, { descendants: true },] }],
        backdropClass: [{ type: Input }],
        ariaLabel: [{ type: Input, args: ['aria-label',] }],
        ariaLabelledby: [{ type: Input, args: ['aria-labelledby',] }],
        ariaDescribedby: [{ type: Input, args: ['aria-describedby',] }],
        xPosition: [{ type: Input }],
        yPosition: [{ type: Input }],
        templateRef: [{ type: ViewChild, args: [TemplateRef,] }],
        items: [{ type: ContentChildren, args: [MatMenuItem, { descendants: false },] }],
        lazyContent: [{ type: ContentChild, args: [MatMenuContent,] }],
        overlapTrigger: [{ type: Input }],
        hasBackdrop: [{ type: Input }],
        panelClass: [{ type: Input, args: ['class',] }],
        classList: [{ type: Input }],
        closed: [{ type: Output }],
        close: [{ type: Output }]
    };
    return _MatMenuBase;
})();
export { _MatMenuBase };
/** @docs-private We show the "_MatMenu" class as "MatMenu" in the docs. */
let MatMenu = /** @class */ (() => {
    class MatMenu extends _MatMenuBase {
    }
    MatMenu.decorators = [
        { type: Directive }
    ];
    return MatMenu;
})();
export { MatMenu };
// Note on the weird inheritance setup: we need three classes, because the MDC-based menu has to
// extend `MatMenu`, however keeping a reference to it will cause the inlined template and styles
// to be retained as well. The MDC menu also has to provide itself as a `MatMenu` in order for
// queries and DI to work correctly, while still not referencing the actual menu class.
// Class responsibility is split up as follows:
// * _MatMenuBase - provides all the functionality without any of the Angular metadata.
// * MatMenu - keeps the same name symbol name as the current menu and
// is used as a provider for DI and query purposes.
// * _MatMenu - the actual menu component implementation with the Angular metadata that should
// be tree shaken away for MDC.
/** @docs-public MatMenu */
let _MatMenu = /** @class */ (() => {
    class _MatMenu extends MatMenu {
        constructor(elementRef, ngZone, defaultOptions) {
            super(elementRef, ngZone, defaultOptions);
        }
    }
    _MatMenu.decorators = [
        { type: Component, args: [{
                    selector: 'mat-menu',
                    template: "<ng-template>\n  <div\n    class=\"mat-menu-panel\"\n    [id]=\"panelId\"\n    [ngClass]=\"_classList\"\n    (keydown)=\"_handleKeydown($event)\"\n    (click)=\"closed.emit('click')\"\n    [@transformMenu]=\"_panelAnimationState\"\n    (@transformMenu.start)=\"_onAnimationStart($event)\"\n    (@transformMenu.done)=\"_onAnimationDone($event)\"\n    tabindex=\"-1\"\n    role=\"menu\"\n    [attr.aria-label]=\"ariaLabel || null\"\n    [attr.aria-labelledby]=\"ariaLabelledby || null\"\n    [attr.aria-describedby]=\"ariaDescribedby || null\">\n    <div class=\"mat-menu-content\">\n      <ng-content></ng-content>\n    </div>\n  </div>\n</ng-template>\n",
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    exportAs: 'matMenu',
                    animations: [
                        matMenuAnimations.transformMenu,
                        matMenuAnimations.fadeInItems
                    ],
                    providers: [
                        { provide: MAT_MENU_PANEL, useExisting: MatMenu },
                        { provide: MatMenu, useExisting: _MatMenu }
                    ],
                    styles: [".mat-menu-panel{min-width:112px;max-width:280px;overflow:auto;-webkit-overflow-scrolling:touch;max-height:calc(100vh - 48px);border-radius:4px;outline:0;min-height:64px}.mat-menu-panel.ng-animating{pointer-events:none}.cdk-high-contrast-active .mat-menu-panel{outline:solid 1px}.mat-menu-content:not(:empty){padding-top:8px;padding-bottom:8px}.mat-menu-item{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;outline:none;border:none;-webkit-tap-highlight-color:transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;line-height:48px;height:48px;padding:0 16px;text-align:left;text-decoration:none;max-width:100%;position:relative}.mat-menu-item::-moz-focus-inner{border:0}.mat-menu-item[disabled]{cursor:default}[dir=rtl] .mat-menu-item{text-align:right}.mat-menu-item .mat-icon{margin-right:16px;vertical-align:middle}.mat-menu-item .mat-icon svg{vertical-align:top}[dir=rtl] .mat-menu-item .mat-icon{margin-left:16px;margin-right:0}.mat-menu-item[disabled]{pointer-events:none}.cdk-high-contrast-active .mat-menu-item.cdk-program-focused,.cdk-high-contrast-active .mat-menu-item.cdk-keyboard-focused,.cdk-high-contrast-active .mat-menu-item-highlighted{outline:dotted 1px}.mat-menu-item-submenu-trigger{padding-right:32px}.mat-menu-item-submenu-trigger::after{width:0;height:0;border-style:solid;border-width:5px 0 5px 5px;border-color:transparent transparent transparent currentColor;content:\"\";display:inline-block;position:absolute;top:50%;right:16px;transform:translateY(-50%)}[dir=rtl] .mat-menu-item-submenu-trigger{padding-right:16px;padding-left:32px}[dir=rtl] .mat-menu-item-submenu-trigger::after{right:auto;left:16px;transform:rotateY(180deg) translateY(-50%)}button.mat-menu-item{width:100%}.mat-menu-item .mat-menu-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}\n"]
                }] }
    ];
    /** @nocollapse */
    _MatMenu.ctorParameters = () => [
        { type: ElementRef },
        { type: NgZone },
        { type: undefined, decorators: [{ type: Inject, args: [MAT_MENU_DEFAULT_OPTIONS,] }] }
    ];
    return _MatMenu;
})();
export { _MatMenu };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVudS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9tZW51L21lbnUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGVBQWUsRUFBYyxNQUFNLG1CQUFtQixDQUFDO0FBRS9ELE9BQU8sRUFBZSxxQkFBcUIsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQzFFLE9BQU8sRUFDTCxNQUFNLEVBQ04sVUFBVSxFQUNWLFdBQVcsRUFDWCxVQUFVLEVBQ1YsUUFBUSxFQUNSLElBQUksRUFDSixHQUFHLEVBQ0gsY0FBYyxHQUNmLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUVMLHVCQUF1QixFQUN2QixTQUFTLEVBQ1QsWUFBWSxFQUNaLGVBQWUsRUFDZixTQUFTLEVBQ1QsVUFBVSxFQUNWLFlBQVksRUFDWixNQUFNLEVBQ04sY0FBYyxFQUNkLEtBQUssRUFDTCxNQUFNLEVBRU4sTUFBTSxFQUNOLFdBQVcsRUFDWCxTQUFTLEVBQ1QsU0FBUyxFQUNULGlCQUFpQixHQUVsQixNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsS0FBSyxFQUFjLE9BQU8sRUFBRSxZQUFZLEVBQUMsTUFBTSxNQUFNLENBQUM7QUFDOUQsT0FBTyxFQUFDLFNBQVMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFDLE1BQU0sZ0JBQWdCLENBQUM7QUFDMUQsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sbUJBQW1CLENBQUM7QUFDcEQsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLGdCQUFnQixDQUFDO0FBRTlDLE9BQU8sRUFBQyw0QkFBNEIsRUFBRSw0QkFBNEIsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN6RixPQUFPLEVBQUMsV0FBVyxFQUFDLE1BQU0sYUFBYSxDQUFDO0FBQ3hDLE9BQU8sRUFBQyxjQUFjLEVBQWUsTUFBTSxjQUFjLENBQUM7QUF3QjFELGlGQUFp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QyxlQUFDO0tBQUE7U0FOWSxRQUFRIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Rm9jdXNLZXlNYW5hZ2VyLCBGb2N1c09yaWdpbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2ExMXknO1xuaW1wb3J0IHtEaXJlY3Rpb259IGZyb20gJ0Bhbmd1bGFyL2Nkay9iaWRpJztcbmltcG9ydCB7Qm9vbGVhbklucHV0LCBjb2VyY2VCb29sZWFuUHJvcGVydHl9IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1xuICBFU0NBUEUsXG4gIExFRlRfQVJST1csXG4gIFJJR0hUX0FSUk9XLFxuICBET1dOX0FSUk9XLFxuICBVUF9BUlJPVyxcbiAgSE9NRSxcbiAgRU5ELFxuICBoYXNNb2RpZmllcktleSxcbn0gZnJvbSAnQGFuZ3VsYXIvY2RrL2tleWNvZGVzJztcbmltcG9ydCB7XG4gIEFmdGVyQ29udGVudEluaXQsXG4gIENoYW5nZURldGVjdGlvblN0cmF0ZWd5LFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBEaXJlY3RpdmUsXG4gIEVsZW1lbnRSZWYsXG4gIEV2ZW50RW1pdHRlcixcbiAgSW5qZWN0LFxuICBJbmplY3Rpb25Ub2tlbixcbiAgSW5wdXQsXG4gIE5nWm9uZSxcbiAgT25EZXN0cm95LFxuICBPdXRwdXQsXG4gIFRlbXBsYXRlUmVmLFxuICBRdWVyeUxpc3QsXG4gIFZpZXdDaGlsZCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIE9uSW5pdCxcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge21lcmdlLCBPYnNlcnZhYmxlLCBTdWJqZWN0LCBTdWJzY3JpcHRpb259IGZyb20gJ3J4anMnO1xuaW1wb3J0IHtzdGFydFdpdGgsIHN3aXRjaE1hcCwgdGFrZX0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuaW1wb3J0IHttYXRNZW51QW5pbWF0aW9uc30gZnJvbSAnLi9tZW51LWFuaW1hdGlvbnMnO1xuaW1wb3J0IHtNYXRNZW51Q29udGVudH0gZnJvbSAnLi9tZW51LWNvbnRlbnQnO1xuaW1wb3J0IHtNZW51UG9zaXRpb25YLCBNZW51UG9zaXRpb25ZfSBmcm9tICcuL21lbnUtcG9zaXRpb25zJztcbmltcG9ydCB7dGhyb3dNYXRNZW51SW52YWxpZFBvc2l0aW9uWCwgdGhyb3dNYXRNZW51SW52YWxpZFBvc2l0aW9uWX0gZnJvbSAnLi9tZW51LWVycm9ycyc7XG5pbXBvcnQge01hdE1lbnVJdGVtfSBmcm9tICcuL21lbnUtaXRlbSc7XG5pbXBvcnQge01BVF9NRU5VX1BBTkVMLCBNYXRNZW51UGFuZWx9IGZyb20gJy4vbWVudS1wYW5lbCc7XG5pbXBvcnQge0FuaW1hdGlvbkV2ZW50fSBmcm9tICdAYW5ndWxhci9hbmltYXRpb25zJztcblxuLyoqIERlZmF1bHQgYG1hdC1tZW51YCBvcHRpb25zIHRoYXQgY2FuIGJlIG92ZXJyaWRkZW4uICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdE1lbnVEZWZhdWx0T3B0aW9ucyB7XG4gIC8qKiBUaGUgeC1heGlzIHBvc2l0aW9uIG9mIHRoZSBtZW51LiAqL1xuICB4UG9zaXRpb246IE1lbnVQb3NpdGlvblg7XG5cbiAgLyoqIFRoZSB5LWF4aXMgcG9zaXRpb24gb2YgdGhlIG1lbnUuICovXG4gIHlQb3NpdGlvbjogTWVudVBvc2l0aW9uWTtcblxuICAvKiogV2hldGhlciB0aGUgbWVudSBzaG91bGQgb3ZlcmxhcCB0aGUgbWVudSB0cmlnZ2VyLiAqL1xuICBvdmVybGFwVHJpZ2dlcjogYm9vbGVhbjtcblxuICAvKiogQ2xhc3MgdG8gYmUgYXBwbGllZCB0byB0aGUgbWVudSdzIGJhY2tkcm9wLiAqL1xuICBiYWNrZHJvcENsYXNzOiBzdHJpbmc7XG5cbiAgLyoqIENsYXNzIG9yIGxpc3Qgb2YgY2xhc3NlcyB0byBiZSBhcHBsaWVkIHRvIHRoZSBtZW51J3Mgb3ZlcmxheSBwYW5lbC4gKi9cbiAgb3ZlcmxheVBhbmVsQ2xhc3M/OiBzdHJpbmcgfCBzdHJpbmdbXTtcblxuICAvKiogV2hldGhlciB0aGUgbWVudSBoYXMgYSBiYWNrZHJvcC4gKi9cbiAgaGFzQmFja2Ryb3A/OiBib29sZWFuO1xufVxuXG4vKiogSW5qZWN0aW9uIHRva2VuIHRvIGJlIHVzZWQgdG8gb3ZlcnJpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgYG1hdC1tZW51YC4gKi9cbmV4cG9ydCBjb25zdCBNQVRfTUVOVV9ERUZBVUxUX09QVElPTlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxNYXRNZW51RGVmYXVsdE9wdGlvbnM+KCdtYXQtbWVudS1kZWZhdWx0LW9wdGlvbnMnLCB7XG4gICAgICBwcm92aWRlZEluOiAncm9vdCcsXG4gICAgICBmYWN0b3J5OiBNQVRfTUVOVV9ERUZBVUxUX09QVElPTlNfRkFDVE9SWVxuICAgIH0pO1xuXG4vKiogQGRvY3MtcHJpdmF0ZSAqL1xuZXhwb3J0IGZ1bmN0aW9uIE1BVF9NRU5VX0RFRkFVTFRfT1BUSU9OU19GQUNUT1JZKCk6IE1hdE1lbnVEZWZhdWx0T3B0aW9ucyB7XG4gIHJldHVybiB7XG4gICAgb3ZlcmxhcFRyaWdnZXI6IGZhbHNlLFxuICAgIHhQb3NpdGlvbjogJ2FmdGVyJyxcbiAgICB5UG9zaXRpb246ICdiZWxvdycsXG4gICAgYmFja2Ryb3BDbGFzczogJ2Nkay1vdmVybGF5LXRyYW5zcGFyZW50LWJhY2tkcm9wJyxcbiAgfTtcbn1cbi8qKlxuICogU3RhcnQgZWxldmF0aW9uIGZvciB0aGUgbWVudSBwYW5lbC5cbiAqIEBkb2NzLXByaXZhdGVcbiAqL1xuY29uc3QgTUFUX01FTlVfQkFTRV9FTEVWQVRJT04gPSA0O1xuXG5sZXQgbWVudVBhbmVsVWlkID0gMDtcblxuLyoqIEJhc2UgY2xhc3Mgd2l0aCBhbGwgb2YgdGhlIGBNYXRNZW51YCBmdW5jdGlvbmFsaXR5LiAqL1xuQERpcmVjdGl2ZSgpXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6Y2xhc3MtbmFtZVxuZXhwb3J0IGNsYXNzIF9NYXRNZW51QmFzZSBpbXBsZW1lbnRzIEFmdGVyQ29udGVudEluaXQsIE1hdE1lbnVQYW5lbDxNYXRNZW51SXRlbT4sIE9uSW5pdCxcbiAgT25EZXN0cm95IHtcbiAgcHJpdmF0ZSBfa2V5TWFuYWdlcjogRm9jdXNLZXlNYW5hZ2VyPE1hdE1lbnVJdGVtPjtcbiAgcHJpdmF0ZSBfeFBvc2l0aW9uOiBNZW51UG9zaXRpb25YID0gdGhpcy5fZGVmYXVsdE9wdGlvbnMueFBvc2l0aW9uO1xuICBwcml2YXRlIF95UG9zaXRpb246IE1lbnVQb3NpdGlvblkgPSB0aGlzLl9kZWZhdWx0T3B0aW9ucy55UG9zaXRpb247XG4gIHByaXZhdGUgX3ByZXZpb3VzRWxldmF0aW9uOiBzdHJpbmc7XG5cbiAgLyoqIEFsbCBpdGVtcyBpbnNpZGUgdGhlIG1lbnUuIEluY2x1ZGVzIGl0ZW1zIG5lc3RlZCBpbnNpZGUgYW5vdGhlciBtZW51LiAqL1xuICBAQ29udGVudENoaWxkcmVuKE1hdE1lbnVJdGVtLCB7ZGVzY2VuZGFudHM6IHRydWV9KSBfYWxsSXRlbXM6IFF1ZXJ5TGlzdDxNYXRNZW51SXRlbT47XG5cbiAgLyoqIE9ubHkgdGhlIGRpcmVjdCBkZXNjZW5kYW50IG1lbnUgaXRlbXMuICovXG4gIHByaXZhdGUgX2RpcmVjdERlc2NlbmRhbnRJdGVtcyA9IG5ldyBRdWVyeUxpc3Q8TWF0TWVudUl0ZW0+KCk7XG5cbiAgLyoqIFN1YnNjcmlwdGlvbiB0byB0YWIgZXZlbnRzIG9uIHRoZSBtZW51IHBhbmVsICovXG4gIHByaXZhdGUgX3RhYlN1YnNjcmlwdGlvbiA9IFN1YnNjcmlwdGlvbi5FTVBUWTtcblxuICAvKiogQ29uZmlnIG9iamVjdCB0byBiZSBwYXNzZWQgaW50byB0aGUgbWVudSdzIG5nQ2xhc3MgKi9cbiAgX2NsYXNzTGlzdDoge1trZXk6IHN0cmluZ106IGJvb2xlYW59ID0ge307XG5cbiAgLyoqIEN1cnJlbnQgc3RhdGUgb2YgdGhlIHBhbmVsIGFuaW1hdGlvbi4gKi9cbiAgX3BhbmVsQW5pbWF0aW9uU3RhdGU6ICd2b2lkJyB8ICdlbnRlcicgPSAndm9pZCc7XG5cbiAgLyoqIEVtaXRzIHdoZW5ldmVyIGFuIGFuaW1hdGlvbiBvbiB0aGUgbWVudSBjb21wbGV0ZXMuICovXG4gIF9hbmltYXRpb25Eb25lID0gbmV3IFN1YmplY3Q8QW5pbWF0aW9uRXZlbnQ+KCk7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaXMgYW5pbWF0aW5nLiAqL1xuICBfaXNBbmltYXRpbmc6IGJvb2xlYW47XG5cbiAgLyoqIFBhcmVudCBtZW51IG9mIHRoZSBjdXJyZW50IG1lbnUgcGFuZWwuICovXG4gIHBhcmVudE1lbnU6IE1hdE1lbnVQYW5lbCB8IHVuZGVmaW5lZDtcblxuICAvKiogTGF5b3V0IGRpcmVjdGlvbiBvZiB0aGUgbWVudS4gKi9cbiAgZGlyZWN0aW9uOiBEaXJlY3Rpb247XG5cbiAgLyoqIENsYXNzIG9yIGxpc3Qgb2YgY2xhc3NlcyB0byBiZSBhZGRlZCB0byB0aGUgb3ZlcmxheSBwYW5lbC4gKi9cbiAgb3ZlcmxheVBhbmVsQ2xhc3M6IHN0cmluZ3xzdHJpbmdbXSA9IHRoaXMuX2RlZmF1bHRPcHRpb25zLm92ZXJsYXlQYW5lbENsYXNzIHx8ICcnO1xuXG4gIC8qKiBDbGFzcyB0byBiZSBhZGRlZCB0byB0aGUgYmFja2Ryb3AgZWxlbWVudC4gKi9cbiAgQElucHV0KCkgYmFja2Ryb3BDbGFzczogc3RyaW5nID0gdGhpcy5fZGVmYXVsdE9wdGlvbnMuYmFja2Ryb3BDbGFzcztcblxuICAvKiogYXJpYS1sYWJlbCBmb3IgdGhlIG1lbnUgcGFuZWwuICovXG4gIEBJbnB1dCgnYXJpYS1sYWJlbCcpIGFyaWFMYWJlbDogc3RyaW5nO1xuXG4gIC8qKiBhcmlhLWxhYmVsbGVkYnkgZm9yIHRoZSBtZW51IHBhbmVsLiAqL1xuICBASW5wdXQoJ2FyaWEtbGFiZWxsZWRieScpIGFyaWFMYWJlbGxlZGJ5OiBzdHJpbmc7XG5cbiAgLyoqIGFyaWEtZGVzY3JpYmVkYnkgZm9yIHRoZSBtZW51IHBhbmVsLiAqL1xuICBASW5wdXQoJ2FyaWEtZGVzY3JpYmVkYnknKSBhcmlhRGVzY3JpYmVkYnk6IHN0cmluZztcblxuICAvKiogUG9zaXRpb24gb2YgdGhlIG1lbnUgaW4gdGhlIFggYXhpcy4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHhQb3NpdGlvbigpOiBNZW51UG9zaXRpb25YIHsgcmV0dXJuIHRoaXMuX3hQb3NpdGlvbjsgfVxuICBzZXQgeFBvc2l0aW9uKHZhbHVlOiBNZW51UG9zaXRpb25YKSB7XG4gICAgaWYgKHZhbHVlICE9PSAnYmVmb3JlJyAmJiB2YWx1ZSAhPT0gJ2FmdGVyJykge1xuICAgICAgdGhyb3dNYXRNZW51SW52YWxpZFBvc2l0aW9uWCgpO1xuICAgIH1cbiAgICB0aGlzLl94UG9zaXRpb24gPSB2YWx1ZTtcbiAgICB0aGlzLnNldFBvc2l0aW9uQ2xhc3NlcygpO1xuICB9XG5cbiAgLyoqIFBvc2l0aW9uIG9mIHRoZSBtZW51IGluIHRoZSBZIGF4aXMuICovXG4gIEBJbnB1dCgpXG4gIGdldCB5UG9zaXRpb24oKTogTWVudVBvc2l0aW9uWSB7IHJldHVybiB0aGlzLl95UG9zaXRpb247IH1cbiAgc2V0IHlQb3NpdGlvbih2YWx1ZTogTWVudVBvc2l0aW9uWSkge1xuICAgIGlmICh2YWx1ZSAhPT0gJ2Fib3ZlJyAmJiB2YWx1ZSAhPT0gJ2JlbG93Jykge1xuICAgICAgdGhyb3dNYXRNZW51SW52YWxpZFBvc2l0aW9uWSgpO1xuICAgIH1cbiAgICB0aGlzLl95UG9zaXRpb24gPSB2YWx1ZTtcbiAgICB0aGlzLnNldFBvc2l0aW9uQ2xhc3NlcygpO1xuICB9XG5cbiAgLyoqIEBkb2NzLXByaXZhdGUgKi9cbiAgQFZpZXdDaGlsZChUZW1wbGF0ZVJlZikgdGVtcGxhdGVSZWY6IFRlbXBsYXRlUmVmPGFueT47XG5cbiAgLyoqXG4gICAqIExpc3Qgb2YgdGhlIGl0ZW1zIGluc2lkZSBvZiBhIG1lbnUuXG4gICAqIEBkZXByZWNhdGVkXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOC4wLjBcbiAgICovXG4gIEBDb250ZW50Q2hpbGRyZW4oTWF0TWVudUl0ZW0sIHtkZXNjZW5kYW50czogZmFsc2V9KSBpdGVtczogUXVlcnlMaXN0PE1hdE1lbnVJdGVtPjtcblxuICAvKipcbiAgICogTWVudSBjb250ZW50IHRoYXQgd2lsbCBiZSByZW5kZXJlZCBsYXppbHkuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIEBDb250ZW50Q2hpbGQoTWF0TWVudUNvbnRlbnQpIGxhenlDb250ZW50OiBNYXRNZW51Q29udGVudDtcblxuICAvKiogV2hldGhlciB0aGUgbWVudSBzaG91bGQgb3ZlcmxhcCBpdHMgdHJpZ2dlci4gKi9cbiAgQElucHV0KClcbiAgZ2V0IG92ZXJsYXBUcmlnZ2VyKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fb3ZlcmxhcFRyaWdnZXI7IH1cbiAgc2V0IG92ZXJsYXBUcmlnZ2VyKHZhbHVlOiBib29sZWFuKSB7XG4gICAgdGhpcy5fb3ZlcmxhcFRyaWdnZXIgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX292ZXJsYXBUcmlnZ2VyOiBib29sZWFuID0gdGhpcy5fZGVmYXVsdE9wdGlvbnMub3ZlcmxhcFRyaWdnZXI7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIG1lbnUgaGFzIGEgYmFja2Ryb3AuICovXG4gIEBJbnB1dCgpXG4gIGdldCBoYXNCYWNrZHJvcCgpOiBib29sZWFuIHwgdW5kZWZpbmVkIHsgcmV0dXJuIHRoaXMuX2hhc0JhY2tkcm9wOyB9XG4gIHNldCBoYXNCYWNrZHJvcCh2YWx1ZTogYm9vbGVhbiB8IHVuZGVmaW5lZCkge1xuICAgIHRoaXMuX2hhc0JhY2tkcm9wID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTtcbiAgfVxuICBwcml2YXRlIF9oYXNCYWNrZHJvcDogYm9vbGVhbiB8IHVuZGVmaW5lZCA9IHRoaXMuX2RlZmF1bHRPcHRpb25zLmhhc0JhY2tkcm9wO1xuXG4gIC8qKlxuICAgKiBUaGlzIG1ldGhvZCB0YWtlcyBjbGFzc2VzIHNldCBvbiB0aGUgaG9zdCBtYXQtbWVudSBlbGVtZW50IGFuZCBhcHBsaWVzIHRoZW0gb24gdGhlXG4gICAqIG1lbnUgdGVtcGxhdGUgdGhhdCBkaXNwbGF5cyBpbiB0aGUgb3ZlcmxheSBjb250YWluZXIuICBPdGhlcndpc2UsIGl0J3MgZGlmZmljdWx0XG4gICAqIHRvIHN0eWxlIHRoZSBjb250YWluaW5nIG1lbnUgZnJvbSBvdXRzaWRlIHRoZSBjb21wb25lbnQuXG4gICAqIEBwYXJhbSBjbGFzc2VzIGxpc3Qgb2YgY2xhc3MgbmFtZXNcbiAgICovXG4gIEBJbnB1dCgnY2xhc3MnKVxuICBzZXQgcGFuZWxDbGFzcyhjbGFzc2VzOiBzdHJpbmcpIHtcbiAgICBjb25zdCBwcmV2aW91c1BhbmVsQ2xhc3MgPSB0aGlzLl9wcmV2aW91c1BhbmVsQ2xhc3M7XG5cbiAgICBpZiAocHJldmlvdXNQYW5lbENsYXNzICYmIHByZXZpb3VzUGFuZWxDbGFzcy5sZW5ndGgpIHtcbiAgICAgIHByZXZpb3VzUGFuZWxDbGFzcy5zcGxpdCgnICcpLmZvckVhY2goKGNsYXNzTmFtZTogc3RyaW5nKSA9PiB7XG4gICAgICAgIHRoaXMuX2NsYXNzTGlzdFtjbGFzc05hbWVdID0gZmFsc2U7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLl9wcmV2aW91c1BhbmVsQ2xhc3MgPSBjbGFzc2VzO1xuXG4gICAgaWYgKGNsYXNzZXMgJiYgY2xhc3Nlcy5sZW5ndGgpIHtcbiAgICAgIGNsYXNzZXMuc3BsaXQoJyAnKS5mb3JFYWNoKChjbGFzc05hbWU6IHN0cmluZykgPT4ge1xuICAgICAgICB0aGlzLl9jbGFzc0xpc3RbY2xhc3NOYW1lXSA9IHRydWU7XG4gICAgICB9KTtcblxuICAgICAgdGhpcy5fZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmNsYXNzTmFtZSA9ICcnO1xuICAgIH1cbiAgfVxuICBwcml2YXRlIF9wcmV2aW91c1BhbmVsQ2xhc3M6IHN0cmluZztcblxuICAvKipcbiAgICogVGhpcyBtZXRob2QgdGFrZXMgY2xhc3NlcyBzZXQgb24gdGhlIGhvc3QgbWF0LW1lbnUgZWxlbWVudCBhbmQgYXBwbGllcyB0aGVtIG9uIHRoZVxuICAgKiBtZW51IHRlbXBsYXRlIHRoYXQgZGlzcGxheXMgaW4gdGhlIG92ZXJsYXkgY29udGFpbmVyLiAgT3RoZXJ3aXNlLCBpdCdzIGRpZmZpY3VsdFxuICAgKiB0byBzdHlsZSB0aGUgY29udGFpbmluZyBtZW51IGZyb20gb3V0c2lkZSB0aGUgY29tcG9uZW50LlxuICAgKiBAZGVwcmVjYXRlZCBVc2UgYHBhbmVsQ2xhc3NgIGluc3RlYWQuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOC4wLjBcbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBjbGFzc0xpc3QoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMucGFuZWxDbGFzczsgfVxuICBzZXQgY2xhc3NMaXN0KGNsYXNzZXM6IHN0cmluZykgeyB0aGlzLnBhbmVsQ2xhc3MgPSBjbGFzc2VzOyB9XG5cbiAgLyoqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgbWVudSBpcyBjbG9zZWQuICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBjbG9zZWQ6IEV2ZW50RW1pdHRlcjx2b2lkIHwgJ2NsaWNrJyB8ICdrZXlkb3duJyB8ICd0YWInPiA9XG4gICAgICBuZXcgRXZlbnRFbWl0dGVyPHZvaWQgfCAnY2xpY2snIHwgJ2tleWRvd24nIHwgJ3RhYic+KCk7XG5cbiAgLyoqXG4gICAqIEV2ZW50IGVtaXR0ZWQgd2hlbiB0aGUgbWVudSBpcyBjbG9zZWQuXG4gICAqIEBkZXByZWNhdGVkIFN3aXRjaCB0byBgY2xvc2VkYCBpbnN0ZWFkXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOC4wLjBcbiAgICovXG4gIEBPdXRwdXQoKSBjbG9zZTogRXZlbnRFbWl0dGVyPHZvaWQgfCAnY2xpY2snIHwgJ2tleWRvd24nIHwgJ3RhYic+ID0gdGhpcy5jbG9zZWQ7XG5cbiAgcmVhZG9ubHkgcGFuZWxJZCA9IGBtYXQtbWVudS1wYW5lbC0ke21lbnVQYW5lbFVpZCsrfWA7XG5cbiAgY29uc3RydWN0b3IoXG4gICAgcHJpdmF0ZSBfZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgcHJpdmF0ZSBfbmdab25lOiBOZ1pvbmUsXG4gICAgQEluamVjdChNQVRfTUVOVV9ERUZBVUxUX09QVElPTlMpIHByaXZhdGUgX2RlZmF1bHRPcHRpb25zOiBNYXRNZW51RGVmYXVsdE9wdGlvbnMpIHsgfVxuXG4gIG5nT25Jbml0KCkge1xuICAgIHRoaXMuc2V0UG9zaXRpb25DbGFzc2VzKCk7XG4gIH1cblxuICBuZ0FmdGVyQ29udGVudEluaXQoKSB7XG4gICAgdGhpcy5fdXBkYXRlRGlyZWN0RGVzY2VuZGFudHMoKTtcbiAgICB0aGlzLl9rZXlNYW5hZ2VyID0gbmV3IEZvY3VzS2V5TWFuYWdlcih0aGlzLl9kaXJlY3REZXNjZW5kYW50SXRlbXMpLndpdGhXcmFwKCkud2l0aFR5cGVBaGVhZCgpO1xuICAgIHRoaXMuX3RhYlN1YnNjcmlwdGlvbiA9IHRoaXMuX2tleU1hbmFnZXIudGFiT3V0LnN1YnNjcmliZSgoKSA9PiB0aGlzLmNsb3NlZC5lbWl0KCd0YWInKSk7XG5cbiAgICAvLyBJZiBhIHVzZXIgbWFudWFsbHkgKHByb2dyYW1hdGljYWxseSkgZm9jdXNlcyBhIG1lbnUgaXRlbSwgd2UgbmVlZCB0byByZWZsZWN0IHRoYXQgZm9jdXNcbiAgICAvLyBjaGFuZ2UgYmFjayB0byB0aGUga2V5IG1hbmFnZXIuIE5vdGUgdGhhdCB3ZSBkb24ndCBuZWVkIHRvIHVuc3Vic2NyaWJlIGhlcmUgYmVjYXVzZSBfZm9jdXNlZFxuICAgIC8vIGlzIGludGVybmFsIGFuZCB3ZSBrbm93IHRoYXQgaXQgZ2V0cyBjb21wbGV0ZWQgb24gZGVzdHJveS5cbiAgICB0aGlzLl9kaXJlY3REZXNjZW5kYW50SXRlbXMuY2hhbmdlcy5waXBlKFxuICAgICAgc3RhcnRXaXRoKHRoaXMuX2RpcmVjdERlc2NlbmRhbnRJdGVtcyksXG4gICAgICBzd2l0Y2hNYXAoaXRlbXMgPT4gbWVyZ2U8TWF0TWVudUl0ZW0+KC4uLml0ZW1zLm1hcCgoaXRlbTogTWF0TWVudUl0ZW0pID0+IGl0ZW0uX2ZvY3VzZWQpKSlcbiAgICApLnN1YnNjcmliZShmb2N1c2VkSXRlbSA9PiB0aGlzLl9rZXlNYW5hZ2VyLnVwZGF0ZUFjdGl2ZUl0ZW0oZm9jdXNlZEl0ZW0pKTtcbiAgfVxuXG4gIG5nT25EZXN0cm95KCkge1xuICAgIHRoaXMuX2RpcmVjdERlc2NlbmRhbnRJdGVtcy5kZXN0cm95KCk7XG4gICAgdGhpcy5fdGFiU3Vic2NyaXB0aW9uLnVuc3Vic2NyaWJlKCk7XG4gICAgdGhpcy5jbG9zZWQuY29tcGxldGUoKTtcbiAgfVxuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuZXZlciB0aGUgaG92ZXJlZCBtZW51IGl0ZW0gY2hhbmdlcy4gKi9cbiAgX2hvdmVyZWQoKTogT2JzZXJ2YWJsZTxNYXRNZW51SXRlbT4ge1xuICAgIC8vIENvZXJjZSB0aGUgYGNoYW5nZXNgIHByb3BlcnR5IGJlY2F1c2UgQW5ndWxhciB0eXBlcyBpdCBhcyBgT2JzZXJ2YWJsZTxhbnk+YFxuICAgIGNvbnN0IGl0ZW1DaGFuZ2VzID0gdGhpcy5fZGlyZWN0RGVzY2VuZGFudEl0ZW1zLmNoYW5nZXMgYXMgT2JzZXJ2YWJsZTxRdWVyeUxpc3Q8TWF0TWVudUl0ZW0+PjtcbiAgICByZXR1cm4gaXRlbUNoYW5nZXMucGlwZShcbiAgICAgIHN0YXJ0V2l0aCh0aGlzLl9kaXJlY3REZXNjZW5kYW50SXRlbXMpLFxuICAgICAgc3dpdGNoTWFwKGl0ZW1zID0+IG1lcmdlKC4uLml0ZW1zLm1hcCgoaXRlbTogTWF0TWVudUl0ZW0pID0+IGl0ZW0uX2hvdmVyZWQpKSlcbiAgICApIGFzIE9ic2VydmFibGU8TWF0TWVudUl0ZW0+O1xuICB9XG5cbiAgLypcbiAgICogUmVnaXN0ZXJzIGEgbWVudSBpdGVtIHdpdGggdGhlIG1lbnUuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICogQGRlcHJlY2F0ZWQgTm8gbG9uZ2VyIGJlaW5nIHVzZWQuIFRvIGJlIHJlbW92ZWQuXG4gICAqIEBicmVha2luZy1jaGFuZ2UgOS4wLjBcbiAgICovXG4gIGFkZEl0ZW0oX2l0ZW06IE1hdE1lbnVJdGVtKSB7fVxuXG4gIC8qKlxuICAgKiBSZW1vdmVzIGFuIGl0ZW0gZnJvbSB0aGUgbWVudS5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKiBAZGVwcmVjYXRlZCBObyBsb25nZXIgYmVpbmcgdXNlZC4gVG8gYmUgcmVtb3ZlZC5cbiAgICogQGJyZWFraW5nLWNoYW5nZSA5LjAuMFxuICAgKi9cbiAgcmVtb3ZlSXRlbShfaXRlbTogTWF0TWVudUl0ZW0pIHt9XG5cbiAgLyoqIEhhbmRsZSBhIGtleWJvYXJkIGV2ZW50IGZyb20gdGhlIG1lbnUsIGRlbGVnYXRpbmcgdG8gdGhlIGFwcHJvcHJpYXRlIGFjdGlvbi4gKi9cbiAgX2hhbmRsZUtleWRvd24oZXZlbnQ6IEtleWJvYXJkRXZlbnQpIHtcbiAgICBjb25zdCBrZXlDb2RlID0gZXZlbnQua2V5Q29kZTtcbiAgICBjb25zdCBtYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcblxuICAgIHN3aXRjaCAoa2V5Q29kZSkge1xuICAgICAgY2FzZSBFU0NBUEU6XG4gICAgICAgIGlmICghaGFzTW9kaWZpZXJLZXkoZXZlbnQpKSB7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICB0aGlzLmNsb3NlZC5lbWl0KCdrZXlkb3duJyk7XG4gICAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgICAgY2FzZSBMRUZUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5wYXJlbnRNZW51ICYmIHRoaXMuZGlyZWN0aW9uID09PSAnbHRyJykge1xuICAgICAgICAgIHRoaXMuY2xvc2VkLmVtaXQoJ2tleWRvd24nKTtcbiAgICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIFJJR0hUX0FSUk9XOlxuICAgICAgICBpZiAodGhpcy5wYXJlbnRNZW51ICYmIHRoaXMuZGlyZWN0aW9uID09PSAncnRsJykge1xuICAgICAgICAgIHRoaXMuY2xvc2VkLmVtaXQoJ2tleWRvd24nKTtcbiAgICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgICBjYXNlIEhPTUU6XG4gICAgICBjYXNlIEVORDpcbiAgICAgICAgaWYgKCFoYXNNb2RpZmllcktleShldmVudCkpIHtcbiAgICAgICAgICBrZXlDb2RlID09PSBIT01FID8gbWFuYWdlci5zZXRGaXJzdEl0ZW1BY3RpdmUoKSA6IG1hbmFnZXIuc2V0TGFzdEl0ZW1BY3RpdmUoKTtcbiAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9XG4gICAgICBicmVhaztcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIGlmIChrZXlDb2RlID09PSBVUF9BUlJPVyB8fCBrZXlDb2RlID09PSBET1dOX0FSUk9XKSB7XG4gICAgICAgICAgbWFuYWdlci5zZXRGb2N1c09yaWdpbigna2V5Ym9hcmQnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIG1hbmFnZXIub25LZXlkb3duKGV2ZW50KTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogRm9jdXMgdGhlIGZpcnN0IGl0ZW0gaW4gdGhlIG1lbnUuXG4gICAqIEBwYXJhbSBvcmlnaW4gQWN0aW9uIGZyb20gd2hpY2ggdGhlIGZvY3VzIG9yaWdpbmF0ZWQuIFVzZWQgdG8gc2V0IHRoZSBjb3JyZWN0IHN0eWxpbmcuXG4gICAqL1xuICBmb2N1c0ZpcnN0SXRlbShvcmlnaW46IEZvY3VzT3JpZ2luID0gJ3Byb2dyYW0nKTogdm9pZCB7XG4gICAgLy8gV2hlbiB0aGUgY29udGVudCBpcyByZW5kZXJlZCBsYXppbHksIGl0IHRha2VzIGEgYml0IGJlZm9yZSB0aGUgaXRlbXMgYXJlIGluc2lkZSB0aGUgRE9NLlxuICAgIGlmICh0aGlzLmxhenlDb250ZW50KSB7XG4gICAgICB0aGlzLl9uZ1pvbmUub25TdGFibGUuYXNPYnNlcnZhYmxlKClcbiAgICAgICAgLnBpcGUodGFrZSgxKSlcbiAgICAgICAgLnN1YnNjcmliZSgoKSA9PiB0aGlzLl9mb2N1c0ZpcnN0SXRlbShvcmlnaW4pKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fZm9jdXNGaXJzdEl0ZW0ob3JpZ2luKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogQWN0dWFsIGltcGxlbWVudGF0aW9uIHRoYXQgZm9jdXNlcyB0aGUgZmlyc3QgaXRlbS4gTmVlZHMgdG8gYmUgc2VwYXJhdGVkXG4gICAqIG91dCBzbyB3ZSBkb24ndCByZXBlYXQgdGhlIHNhbWUgbG9naWMgaW4gdGhlIHB1YmxpYyBgZm9jdXNGaXJzdEl0ZW1gIG1ldGhvZC5cbiAgICovXG4gIHByaXZhdGUgX2ZvY3VzRmlyc3RJdGVtKG9yaWdpbjogRm9jdXNPcmlnaW4pIHtcbiAgICBjb25zdCBtYW5hZ2VyID0gdGhpcy5fa2V5TWFuYWdlcjtcblxuICAgIG1hbmFnZXIuc2V0Rm9jdXNPcmlnaW4ob3JpZ2luKS5zZXRGaXJzdEl0ZW1BY3RpdmUoKTtcblxuICAgIC8vIElmIHRoZXJlJ3Mgbm8gYWN0aXZlIGl0ZW0gYXQgdGhpcyBwb2ludCwgaXQgbWVhbnMgdGhhdCBhbGwgdGhlIGl0ZW1zIGFyZSBkaXNhYmxlZC5cbiAgICAvLyBNb3ZlIGZvY3VzIHRvIHRoZSBtZW51IHBhbmVsIHNvIGtleWJvYXJkIGV2ZW50cyBsaWtlIEVzY2FwZSBzdGlsbCB3b3JrLiBBbHNvIHRoaXMgd2lsbFxuICAgIC8vIGdpdmUgX3NvbWVfIGZlZWRiYWNrIHRvIHNjcmVlbiByZWFkZXJzLlxuICAgIGlmICghbWFuYWdlci5hY3RpdmVJdGVtICYmIHRoaXMuX2RpcmVjdERlc2NlbmRhbnRJdGVtcy5sZW5ndGgpIHtcbiAgICAgIGxldCBlbGVtZW50ID0gdGhpcy5fZGlyZWN0RGVzY2VuZGFudEl0ZW1zLmZpcnN0Ll9nZXRIb3N0RWxlbWVudCgpLnBhcmVudEVsZW1lbnQ7XG5cbiAgICAgIC8vIEJlY2F1c2UgdGhlIGBtYXQtbWVudWAgaXMgYXQgdGhlIERPTSBpbnNlcnRpb24gcG9pbnQsIG5vdCBpbnNpZGUgdGhlIG92ZXJsYXksIHdlIGRvbid0XG4gICAgICAvLyBoYXZlIGEgbmljZSB3YXkgb2YgZ2V0dGluZyBhIGhvbGQgb2YgdGhlIG1lbnUgcGFuZWwuIFdlIGNhbid0IHVzZSBhIGBWaWV3Q2hpbGRgIGVpdGhlclxuICAgICAgLy8gYmVjYXVzZSB0aGUgcGFuZWwgaXMgaW5zaWRlIGFuIGBuZy10ZW1wbGF0ZWAuIFdlIHdvcmsgYXJvdW5kIGl0IGJ5IHN0YXJ0aW5nIGZyb20gb25lIG9mXG4gICAgICAvLyB0aGUgaXRlbXMgYW5kIHdhbGtpbmcgdXAgdGhlIERPTS5cbiAgICAgIHdoaWxlIChlbGVtZW50KSB7XG4gICAgICAgIGlmIChlbGVtZW50LmdldEF0dHJpYnV0ZSgncm9sZScpID09PSAnbWVudScpIHtcbiAgICAgICAgICBlbGVtZW50LmZvY3VzKCk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZWxlbWVudCA9IGVsZW1lbnQucGFyZW50RWxlbWVudDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBSZXNldHMgdGhlIGFjdGl2ZSBpdGVtIGluIHRoZSBtZW51LiBUaGlzIGlzIHVzZWQgd2hlbiB0aGUgbWVudSBpcyBvcGVuZWQsIGFsbG93aW5nXG4gICAqIHRoZSB1c2VyIHRvIHN0YXJ0IGZyb20gdGhlIGZpcnN0IG9wdGlvbiB3aGVuIHByZXNzaW5nIHRoZSBkb3duIGFycm93LlxuICAgKi9cbiAgcmVzZXRBY3RpdmVJdGVtKCkge1xuICAgIHRoaXMuX2tleU1hbmFnZXIuc2V0QWN0aXZlSXRlbSgtMSk7XG4gIH1cblxuICAvKipcbiAgICogU2V0cyB0aGUgbWVudSBwYW5lbCBlbGV2YXRpb24uXG4gICAqIEBwYXJhbSBkZXB0aCBOdW1iZXIgb2YgcGFyZW50IG1lbnVzIHRoYXQgY29tZSBiZWZvcmUgdGhlIG1lbnUuXG4gICAqL1xuICBzZXRFbGV2YXRpb24oZGVwdGg6IG51bWJlcik6IHZvaWQge1xuICAgIC8vIFRoZSBlbGV2YXRpb24gc3RhcnRzIGF0IHRoZSBiYXNlIGFuZCBpbmNyZWFzZXMgYnkgb25lIGZvciBlYWNoIGxldmVsLlxuICAgIC8vIENhcHBlZCBhdCAyNCBiZWNhdXNlIHRoYXQncyB0aGUgbWF4aW11bSBlbGV2YXRpb24gZGVmaW5lZCBpbiB0aGUgTWF0ZXJpYWwgZGVzaWduIHNwZWMuXG4gICAgY29uc3QgZWxldmF0aW9uID0gTWF0aC5taW4oTUFUX01FTlVfQkFTRV9FTEVWQVRJT04gKyBkZXB0aCwgMjQpO1xuICAgIGNvbnN0IG5ld0VsZXZhdGlvbiA9IGBtYXQtZWxldmF0aW9uLXoke2VsZXZhdGlvbn1gO1xuICAgIGNvbnN0IGN1c3RvbUVsZXZhdGlvbiA9IE9iamVjdC5rZXlzKHRoaXMuX2NsYXNzTGlzdCkuZmluZChjID0+IGMuc3RhcnRzV2l0aCgnbWF0LWVsZXZhdGlvbi16JykpO1xuXG4gICAgaWYgKCFjdXN0b21FbGV2YXRpb24gfHwgY3VzdG9tRWxldmF0aW9uID09PSB0aGlzLl9wcmV2aW91c0VsZXZhdGlvbikge1xuICAgICAgaWYgKHRoaXMuX3ByZXZpb3VzRWxldmF0aW9uKSB7XG4gICAgICAgIHRoaXMuX2NsYXNzTGlzdFt0aGlzLl9wcmV2aW91c0VsZXZhdGlvbl0gPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fY2xhc3NMaXN0W25ld0VsZXZhdGlvbl0gPSB0cnVlO1xuICAgICAgdGhpcy5fcHJldmlvdXNFbGV2YXRpb24gPSBuZXdFbGV2YXRpb247XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIEFkZHMgY2xhc3NlcyB0byB0aGUgbWVudSBwYW5lbCBiYXNlZCBvbiBpdHMgcG9zaXRpb24uIENhbiBiZSB1c2VkIGJ5XG4gICAqIGNvbnN1bWVycyB0byBhZGQgc3BlY2lmaWMgc3R5bGluZyBiYXNlZCBvbiB0aGUgcG9zaXRpb24uXG4gICAqIEBwYXJhbSBwb3NYIFBvc2l0aW9uIG9mIHRoZSBtZW51IGFsb25nIHRoZSB4IGF4aXMuXG4gICAqIEBwYXJhbSBwb3NZIFBvc2l0aW9uIG9mIHRoZSBtZW51IGFsb25nIHRoZSB5IGF4aXMuXG4gICAqIEBkb2NzLXByaXZhdGVcbiAgICovXG4gIHNldFBvc2l0aW9uQ2xhc3Nlcyhwb3NYOiBNZW51UG9zaXRpb25YID0gdGhpcy54UG9zaXRpb24sIHBvc1k6IE1lbnVQb3NpdGlvblkgPSB0aGlzLnlQb3NpdGlvbikge1xuICAgIGNvbnN0IGNsYXNzZXMgPSB0aGlzLl9jbGFzc0xpc3Q7XG4gICAgY2xhc3Nlc1snbWF0LW1lbnUtYmVmb3JlJ10gPSBwb3NYID09PSAnYmVmb3JlJztcbiAgICBjbGFzc2VzWydtYXQtbWVudS1hZnRlciddID0gcG9zWCA9PT0gJ2FmdGVyJztcbiAgICBjbGFzc2VzWydtYXQtbWVudS1hYm92ZSddID0gcG9zWSA9PT0gJ2Fib3ZlJztcbiAgICBjbGFzc2VzWydtYXQtbWVudS1iZWxvdyddID0gcG9zWSA9PT0gJ2JlbG93JztcbiAgfVxuXG4gIC8qKiBTdGFydHMgdGhlIGVudGVyIGFuaW1hdGlvbi4gKi9cbiAgX3N0YXJ0QW5pbWF0aW9uKCkge1xuICAgIC8vIEBicmVha2luZy1jaGFuZ2UgOC4wLjAgQ29tYmluZSB3aXRoIF9yZXNldEFuaW1hdGlvbi5cbiAgICB0aGlzLl9wYW5lbEFuaW1hdGlvblN0YXRlID0gJ2VudGVyJztcbiAgfVxuXG4gIC8qKiBSZXNldHMgdGhlIHBhbmVsIGFuaW1hdGlvbiB0byBpdHMgaW5pdGlhbCBzdGF0ZS4gKi9cbiAgX3Jlc2V0QW5pbWF0aW9uKCkge1xuICAgIC8vIEBicmVha2luZy1jaGFuZ2UgOC4wLjAgQ29tYmluZSB3aXRoIF9zdGFydEFuaW1hdGlvbi5cbiAgICB0aGlzLl9wYW5lbEFuaW1hdGlvblN0YXRlID0gJ3ZvaWQnO1xuICB9XG5cbiAgLyoqIENhbGxiYWNrIHRoYXQgaXMgaW52b2tlZCB3aGVuIHRoZSBwYW5lbCBhbmltYXRpb24gY29tcGxldGVzLiAqL1xuICBfb25BbmltYXRpb25Eb25lKGV2ZW50OiBBbmltYXRpb25FdmVudCkge1xuICAgIHRoaXMuX2FuaW1hdGlvbkRvbmUubmV4dChldmVudCk7XG4gICAgdGhpcy5faXNBbmltYXRpbmcgPSBmYWxzZTtcbiAgfVxuXG4gIF9vbkFuaW1hdGlvblN0YXJ0KGV2ZW50OiBBbmltYXRpb25FdmVudCkge1xuICAgIHRoaXMuX2lzQW5pbWF0aW5nID0gdHJ1ZTtcblxuICAgIC8vIFNjcm9sbCB0aGUgY29udGVudCBlbGVtZW50IHRvIHRoZSB0b3AgYXMgc29vbiBhcyB0aGUgYW5pbWF0aW9uIHN0YXJ0cy4gVGhpcyBpcyBuZWNlc3NhcnksXG4gICAgLy8gYmVjYXVzZSB3ZSBtb3ZlIGZvY3VzIHRvIHRoZSBmaXJzdCBpdGVtIHdoaWxlIGl0J3Mgc3RpbGwgYmVpbmcgYW5pbWF0ZWQsIHdoaWNoIGNhbiB0aHJvd1xuICAgIC8vIHRoZSBicm93c2VyIG9mZiB3aGVuIGl0IGRldGVybWluZXMgdGhlIHNjcm9sbCBwb3NpdGlvbi4gQWx0ZXJuYXRpdmVseSB3ZSBjYW4gbW92ZSBmb2N1c1xuICAgIC8vIHdoZW4gdGhlIGFuaW1hdGlvbiBpcyBkb25lLCBob3dldmVyIG1vdmluZyBmb2N1cyBhc3luY2hyb25vdXNseSB3aWxsIGludGVycnVwdCBzY3JlZW5cbiAgICAvLyByZWFkZXJzIHdoaWNoIGFyZSBpbiB0aGUgcHJvY2VzcyBvZiByZWFkaW5nIG91dCB0aGUgbWVudSBhbHJlYWR5LiBXZSB0YWtlIHRoZSBgZWxlbWVudGBcbiAgICAvLyBmcm9tIHRoZSBgZXZlbnRgIHNpbmNlIHdlIGNhbid0IHVzZSBhIGBWaWV3Q2hpbGRgIHRvIGFjY2VzcyB0aGUgcGFuZS5cbiAgICBpZiAoZXZlbnQudG9TdGF0ZSA9PT0gJ2VudGVyJyAmJiB0aGlzLl9rZXlNYW5hZ2VyLmFjdGl2ZUl0ZW1JbmRleCA9PT0gMCkge1xuICAgICAgZXZlbnQuZWxlbWVudC5zY3JvbGxUb3AgPSAwO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXRzIHVwIGEgc3RyZWFtIHRoYXQgd2lsbCBrZWVwIHRyYWNrIG9mIGFueSBuZXdseS1hZGRlZCBtZW51IGl0ZW1zIGFuZCB3aWxsIHVwZGF0ZSB0aGUgbGlzdFxuICAgKiBvZiBkaXJlY3QgZGVzY2VuZGFudHMuIFdlIGNvbGxlY3QgdGhlIGRlc2NlbmRhbnRzIHRoaXMgd2F5LCBiZWNhdXNlIGBfYWxsSXRlbXNgIGNhbiBpbmNsdWRlXG4gICAqIGl0ZW1zIHRoYXQgYXJlIHBhcnQgb2YgY2hpbGQgbWVudXMsIGFuZCB1c2luZyBhIGN1c3RvbSB3YXkgb2YgcmVnaXN0ZXJpbmcgaXRlbXMgaXMgdW5yZWxpYWJsZVxuICAgKiB3aGVuIGl0IGNvbWVzIHRvIG1haW50YWluaW5nIHRoZSBpdGVtIG9yZGVyLlxuICAgKi9cbiAgcHJpdmF0ZSBfdXBkYXRlRGlyZWN0RGVzY2VuZGFudHMoKSB7XG4gICAgdGhpcy5fYWxsSXRlbXMuY2hhbmdlc1xuICAgICAgLnBpcGUoc3RhcnRXaXRoKHRoaXMuX2FsbEl0ZW1zKSlcbiAgICAgIC5zdWJzY3JpYmUoKGl0ZW1zOiBRdWVyeUxpc3Q8TWF0TWVudUl0ZW0+KSA9PiB7XG4gICAgICAgIHRoaXMuX2RpcmVjdERlc2NlbmRhbnRJdGVtcy5yZXNldChpdGVtcy5maWx0ZXIoaXRlbSA9PiBpdGVtLl9wYXJlbnRNZW51ID09PSB0aGlzKSk7XG4gICAgICAgIHRoaXMuX2RpcmVjdERlc2NlbmRhbnRJdGVtcy5ub3RpZnlPbkNoYW5nZXMoKTtcbiAgICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX292ZXJsYXBUcmlnZ2VyOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9oYXNCYWNrZHJvcDogQm9vbGVhbklucHV0O1xufVxuXG4vKiogQGRvY3MtcHJpdmF0ZSBXZSBzaG93IHRoZSBcIl9NYXRNZW51XCIgY2xhc3MgYXMgXCJNYXRNZW51XCIgaW4gdGhlIGRvY3MuICovXG5ARGlyZWN0aXZlKClcbmV4cG9ydCBjbGFzcyBNYXRNZW51IGV4dGVuZHMgX01hdE1lbnVCYXNlIHt9XG5cbi8vIE5vdGUgb24gdGhlIHdlaXJkIGluaGVyaXRhbmNlIHNldHVwOiB3ZSBuZWVkIHRocmVlIGNsYXNzZXMsIGJlY2F1c2UgdGhlIE1EQy1iYXNlZCBtZW51IGhhcyB0b1xuLy8gZXh0ZW5kIGBNYXRNZW51YCwgaG93ZXZlciBrZWVwaW5nIGEgcmVmZXJlbmNlIHRvIGl0IHdpbGwgY2F1c2UgdGhlIGlubGluZWQgdGVtcGxhdGUgYW5kIHN0eWxlc1xuLy8gdG8gYmUgcmV0YWluZWQgYXMgd2VsbC4gVGhlIE1EQyBtZW51IGFsc28gaGFzIHRvIHByb3ZpZGUgaXRzZWxmIGFzIGEgYE1hdE1lbnVgIGluIG9yZGVyIGZvclxuLy8gcXVlcmllcyBhbmQgREkgdG8gd29yayBjb3JyZWN0bHksIHdoaWxlIHN0aWxsIG5vdCByZWZlcmVuY2luZyB0aGUgYWN0dWFsIG1lbnUgY2xhc3MuXG4vLyBDbGFzcyByZXNwb25zaWJpbGl0eSBpcyBzcGxpdCB1cCBhcyBmb2xsb3dzOlxuLy8gKiBfTWF0TWVudUJhc2UgLSBwcm92aWRlcyBhbGwgdGhlIGZ1bmN0aW9uYWxpdHkgd2l0aG91dCBhbnkgb2YgdGhlIEFuZ3VsYXIgbWV0YWRhdGEuXG4vLyAqIE1hdE1lbnUgLSBrZWVwcyB0aGUgc2FtZSBuYW1lIHN5bWJvbCBuYW1lIGFzIHRoZSBjdXJyZW50IG1lbnUgYW5kXG4vLyBpcyB1c2VkIGFzIGEgcHJvdmlkZXIgZm9yIERJIGFuZCBxdWVyeSBwdXJwb3Nlcy5cbi8vICogX01hdE1lbnUgLSB0aGUgYWN0dWFsIG1lbnUgY29tcG9uZW50IGltcGxlbWVudGF0aW9uIHdpdGggdGhlIEFuZ3VsYXIgbWV0YWRhdGEgdGhhdCBzaG91bGRcbi8vIGJlIHRyZWUgc2hha2VuIGF3YXkgZm9yIE1EQy5cblxuLyoqIEBkb2NzLXB1YmxpYyBNYXRNZW51ICovXG5AQ29tcG9uZW50KHtcbiAgc2VsZWN0b3I6ICdtYXQtbWVudScsXG4gIHRlbXBsYXRlVXJsOiAnbWVudS5odG1sJyxcbiAgc3R5bGVVcmxzOiBbJ21lbnUuY3NzJ10sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxuICBleHBvcnRBczogJ21hdE1lbnUnLFxuICBhbmltYXRpb25zOiBbXG4gICAgbWF0TWVudUFuaW1hdGlvbnMudHJhbnNmb3JtTWVudSxcbiAgICBtYXRNZW51QW5pbWF0aW9ucy5mYWRlSW5JdGVtc1xuICBdLFxuICBwcm92aWRlcnM6IFtcbiAgICB7cHJvdmlkZTogTUFUX01FTlVfUEFORUwsIHVzZUV4aXN0aW5nOiBNYXRNZW51fSxcbiAgICB7cHJvdmlkZTogTWF0TWVudSwgdXNlRXhpc3Rpbmc6IF9NYXRNZW51fVxuICBdXG59KVxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOmNsYXNzLW5hbWVcbmV4cG9ydCBjbGFzcyBfTWF0TWVudSBleHRlbmRzIE1hdE1lbnUge1xuXG4gIGNvbnN0cnVjdG9yKGVsZW1lbnRSZWY6IEVsZW1lbnRSZWY8SFRNTEVsZW1lbnQ+LCBuZ1pvbmU6IE5nWm9uZSxcbiAgICAgIEBJbmplY3QoTUFUX01FTlVfREVGQVVMVF9PUFRJT05TKSBkZWZhdWx0T3B0aW9uczogTWF0TWVudURlZmF1bHRPcHRpb25zKSB7XG4gICAgc3VwZXIoZWxlbWVudFJlZiwgbmdab25lLCBkZWZhdWx0T3B0aW9ucyk7XG4gIH1cbn1cbiJdfQ==