import { __decorate, __param, __metadata } from 'tslib';
import { FocusMonitor, FocusKeyManager, isFakeMousedownFromScreenReader } from '@angular/cdk/a11y';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { UP_ARROW, DOWN_ARROW, END, hasModifierKey, HOME, RIGHT_ARROW, LEFT_ARROW, ESCAPE } from '@angular/cdk/keycodes';
import { Directive, Inject, TemplateRef, ComponentFactoryResolver, ApplicationRef, Injector, ViewContainerRef, ChangeDetectorRef, InjectionToken, Input, HostListener, Component, ChangeDetectionStrategy, ViewEncapsulation, Optional, ElementRef, QueryList, EventEmitter, ContentChildren, ViewChild, ContentChild, Output, NgZone, Self, NgModule } from '@angular/core';
import { Subject, Subscription, merge, of, asapScheduler } from 'rxjs';
import { startWith, switchMap, take, filter, takeUntil, delay } from 'rxjs/operators';
import { trigger, state, style, transition, group, query, animate } from '@angular/animations';
import { TemplatePortal, DomPortalOutlet } from '@angular/cdk/portal';
import { DOCUMENT, CommonModule } from '@angular/common';
import { mixinDisableRipple, mixinDisabled, MatCommonModule, MatRippleModule } from '@angular/material/core';
import { Directionality } from '@angular/cdk/bidi';
import { Overlay, OverlayConfig, OverlayModule } from '@angular/cdk/overlay';
import { normalizePassiveListenerOptions } from '@angular/cdk/platform';
import { CdkScrollableModule } from '@angular/cdk/scrolling';

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Animations used by the mat-menu component.
 * Animation duration and timing values are based on:
 * https://material.io/guidelines/components/menus.html#menus-usage
 * @docs-private
 */
const matMenuAnimations = {
    /**
     * This animation controls the menu panel's entry and exit from the page.
     *
     * When the menu panel is added to the DOM, it scales in and fades in its border.
     *
     * When the menu panel is removed from the DOM, it simply fades out after a brief
     * delay to display the ripple.
     */
    transformMenu: trigger('transformMenu', [
        state('void', style({
            opacity: 0,
            transform: 'scale(0.8)'
        })),
        transition('void => enter', group([
            query('.mat-menu-content, .mat-mdc-menu-content', animate('100ms linear', style({
                opacity: 1
            }))),
            animate('120ms cubic-bezier(0, 0, 0.2, 1)', style({ transform: 'scale(1)' })),
        ])),
        transition('* => void', animate('100ms 25ms linear', style({ opacity: 0 })))
    ]),
    /**
     * This animation fades in the background color and content of the menu panel
     * after its containing element is scaled in.
     */
    fadeInItems: trigger('fadeInItems', [
        // TODO(crisbeto): this is inside the `transformMenu`
        // now. Remove next time we do breaking changes.
        state('showing', style({ opacity: 1 })),
        transition('void => *', [
            style({ opacity: 0 }),
            animate('400ms 100ms cubic-bezier(0.55, 0, 0.55, 0.2)')
        ])
    ])
};
/**
 * @deprecated
 * @breaking-change 8.0.0
 * @docs-private
 */
const fadeInItems = matMenuAnimations.fadeInItems;
/**
 * @deprecated
 * @breaking-change 8.0.0
 * @docs-private
 */
const transformMenu = matMenuAnimations.transformMenu;

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Menu content that will be rendered lazily once the menu is opened.
 */
let MatMenuContent = /** @class */ (() => {
    let MatMenuContent = class MatMenuContent {
        constructor(_template, _componentFactoryResolver, _appRef, _injector, _viewContainerRef, _document, _changeDetectorRef) {
            this._template = _template;
            this._componentFactoryResolver = _componentFactoryResolver;
            this._appRef = _appRef;
            this._injector = _injector;
            this._viewContainerRef = _viewContainerRef;
            this._document = _document;
            this._changeDetectorRef = _changeDetectorRef;
            /** Emits when the menu content has been attached. */
            this._attached = new Subject();
        }
        /**
         * Attaches the content with a particular context.
         * @docs-private
         */
        attach(context = {}) {
            if (!this._portal) {
                this._portal = new TemplatePortal(this._template, this._viewContainerRef);
            }
            this.detach();
            if (!this._outlet) {
                this._outlet = new DomPortalOutlet(this._document.createElement('div'), this._componentFactoryResolver, this._appRef, this._injector);
            }
            const element = this._template.elementRef.nativeElement;
            // Because we support opening the same menu from different triggers (which in turn have their
            // own `OverlayRef` panel), we have to re-insert the host element every time, otherwise we
            // risk it staying attached to a pane that's no longer in the DOM.
            element.parentNode.insertBefore(this._outlet.outletElement, element);
            // When `MatMenuContent` is used in an `OnPush` component, the insertion of the menu
            // content via `createEmbeddedView` does not cause the content to be seen as "dirty"
            // by Angular. This causes the `@ContentChildren` for menu items within the menu to
            // not be updated by Angular. By explicitly marking for check here, we tell Angular that
            // it needs to check for new menu items and update the `@ContentChild` in `MatMenu`.
            // @breaking-change 9.0.0 Make change detector ref required
            if (this._changeDetectorRef) {
                this._changeDetectorRef.markForCheck();
            }
            this._portal.attach(this._outlet, context);
            this._attached.next();
        }
        /**
         * Detaches the content.
         * @docs-private
         */
        detach() {
            if (this._portal.isAttached) {
                this._portal.detach();
            }
        }
        ngOnDestroy() {
            if (this._outlet) {
                this._outlet.dispose();
            }
        }
    };
    MatMenuContent = __decorate([
        Directive({
            selector: 'ng-template[matMenuContent]'
        }),
        __param(5, Inject(DOCUMENT)),
        __metadata("design:paramtypes", [TemplateRef,
            ComponentFactoryResolver,
            ApplicationRef,
            Injector,
            ViewContainerRef, Object, ChangeDetectorRef])
    ], MatMenuContent);
    return MatMenuContent;
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Throws an exception for the case when menu trigger doesn't have a valid mat-menu instance
 * @docs-private
 */
function throwMatMenuMissingError() {
    throw Error(`matMenuTriggerFor: must pass in an mat-menu instance.

    Example:
      <mat-menu #menu="matMenu"></mat-menu>
      <button [matMenuTriggerFor]="menu"></button>`);
}
/**
 * Throws an exception for the case when menu's x-position value isn't valid.
 * In other words, it doesn't match 'before' or 'after'.
 * @docs-private
 */
function throwMatMenuInvalidPositionX() {
    throw Error(`xPosition value must be either 'before' or after'.
      Example: <mat-menu xPosition="before" #menu="matMenu"></mat-menu>`);
}
/**
 * Throws an exception for the case when menu's y-position value isn't valid.
 * In other words, it doesn't match 'above' or 'below'.
 * @docs-private
 */
function throwMatMenuInvalidPositionY() {
    throw Error(`yPosition value must be either 'above' or below'.
      Example: <mat-menu yPosition="above" #menu="matMenu"></mat-menu>`);
}

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Injection token used to provide the parent menu to menu-specific components.
 * @docs-private
 */
const MAT_MENU_PANEL = new InjectionToken('MAT_MENU_PANEL');

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
// Boilerplate for applying mixins to MatMenuItem.
/** @docs-private */
class MatMenuItemBase {
}
const _MatMenuItemMixinBase = mixinDisableRipple(mixinDisabled(MatMenuItemBase));
/**
 * Single item inside of a `mat-menu`. Provides the menu item styling and accessibility treatment.
 */
let MatMenuItem = /** @class */ (() => {
    let MatMenuItem = class MatMenuItem extends _MatMenuItemMixinBase {
        constructor(_elementRef, document, _focusMonitor, _parentMenu) {
            // @breaking-change 8.0.0 make `_focusMonitor` and `document` required params.
            super();
            this._elementRef = _elementRef;
            this._focusMonitor = _focusMonitor;
            this._parentMenu = _parentMenu;
            /** ARIA role for the menu item. */
            this.role = 'menuitem';
            /** Stream that emits when the menu item is hovered. */
            this._hovered = new Subject();
            /** Stream that emits when the menu item is focused. */
            this._focused = new Subject();
            /** Whether the menu item is highlighted. */
            this._highlighted = false;
            /** Whether the menu item acts as a trigger for a sub-menu. */
            this._triggersSubmenu = false;
            if (_focusMonitor) {
                // Start monitoring the element so it gets the appropriate focused classes. We want
                // to show the focus style for menu items only when the focus was not caused by a
                // mouse or touch interaction.
                _focusMonitor.monitor(this._elementRef, false);
            }
            if (_parentMenu && _parentMenu.addItem) {
                _parentMenu.addItem(this);
            }
            this._document = document;
        }
        /** Focuses the menu item. */
        focus(origin = 'program', options) {
            if (this._focusMonitor) {
                this._focusMonitor.focusVia(this._getHostElement(), origin, options);
            }
            else {
                this._getHostElement().focus(options);
            }
            this._focused.next(this);
        }
        ngOnDestroy() {
            if (this._focusMonitor) {
                this._focusMonitor.stopMonitoring(this._elementRef);
            }
            if (this._parentMenu && this._parentMenu.removeItem) {
                this._parentMenu.removeItem(this);
            }
            this._hovered.complete();
            this._focused.complete();
        }
        /** Used to set the `tabindex`. */
        _getTabIndex() {
            return this.disabled ? '-1' : '0';
        }
        /** Returns the host DOM element. */
        _getHostElement() {
            return this._elementRef.nativeElement;
        }
        /** Prevents the default element actions if it is disabled. */
        // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
        // In Ivy the `host` bindings will be merged when this class is extended, whereas in
        // ViewEngine they're overwritten.
        // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
        // tslint:disable-next-line:no-host-decorator-in-concrete
        _checkDisabled(event) {
            if (this.disabled) {
                event.preventDefault();
                event.stopPropagation();
            }
        }
        /** Emits to the hover stream. */
        // We have to use a `HostListener` here in order to support both Ivy and ViewEngine.
        // In Ivy the `host` bindings will be merged when this class is extended, whereas in
        // ViewEngine they're overwritten.
        // TODO(crisbeto): we move this back into `host` once Ivy is turned on by default.
        // tslint:disable-next-line:no-host-decorator-in-concrete
        _handleMouseEnter() {
            this._hovered.next(this);
        }
        /** Gets the label to be used when determining whether the option should be focused. */
        getLabel() {
            const element = this._elementRef.nativeElement;
            const textNodeType = this._document ? this._document.TEXT_NODE : 3;
            let output = '';
            if (element.childNodes) {
                const length = element.childNodes.length;
                // Go through all the top-level text nodes and extract their text.
                // We skip anything that's not a text node to prevent the text from
                // being thrown off by something like an icon.
                for (let i = 0; i < length; i++) {
                    if (element.childNodes[i].nodeType === textNodeType) {
                        output += element.childNodes[i].textContent;
                    }
                }
            }
            return output.trim();
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], MatMenuItem.prototype, "role", void 0);
    __decorate([
        HostListener('click', ['$event']),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", [Event]),
        __metadata("design:returntype", void 0)
    ], MatMenuItem.prototype, "_checkDisabled", null);
    __decorate([
        HostListener('mouseenter'),
        __metadata("design:type", Function),
        __metadata("design:paramtypes", []),
        __metadata("design:returntype", void 0)
    ], MatMenuItem.prototype, "_handleMouseEnter", null);
    MatMenuItem = __decorate([
        Component({
            selector: '[mat-menu-item]',
            exportAs: 'matMenuItem',
            inputs: ['disabled', 'disableRipple'],
            host: {
                '[attr.role]': 'role',
                '[class.mat-menu-item]': 'true',
                '[class.mat-menu-item-highlighted]': '_highlighted',
                '[class.mat-menu-item-submenu-trigger]': '_triggersSubmenu',
                '[attr.tabindex]': '_getTabIndex()',
                '[attr.aria-disabled]': 'disabled.toString()',
                '[attr.disabled]': 'disabled || null',
                'class': 'mat-focus-indicator',
            },
            changeDetection: ChangeDetectionStrategy.OnPush,
            encapsulation: ViewEncapsulation.None,
            template: "<ng-content></ng-content>\n<div class=\"mat-menu-ripple\" matRipple\n     [matRippleDisabled]=\"disableRipple || disabled\"\n     [matRippleTrigger]=\"_getHostElement()\">\n</div>\n"
        }),
        __param(1, Inject(DOCUMENT)),
        __param(3, Inject(MAT_MENU_PANEL)), __param(3, Optional()),
        __metadata("design:paramtypes", [ElementRef, Object, FocusMonitor, Object])
    ], MatMenuItem);
    return MatMenuItem;
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Injection token to be used to override the default options for `mat-menu`. */
const MAT_MENU_DEFAULT_OPTIONS = new InjectionToken('mat-menu-default-options', {
    providedIn: 'root',
    factory: MAT_MENU_DEFAULT_OPTIONS_FACTORY
});
/** @docs-private */
function MAT_MENU_DEFAULT_OPTIONS_FACTORY() {
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
    let _MatMenuBase = 
    // tslint:disable-next-line:class-name
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
    };
    __decorate([
        ContentChildren(MatMenuItem, { descendants: true }),
        __metadata("design:type", QueryList)
    ], _MatMenuBase.prototype, "_allItems", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], _MatMenuBase.prototype, "backdropClass", void 0);
    __decorate([
        Input('aria-label'),
        __metadata("design:type", String)
    ], _MatMenuBase.prototype, "ariaLabel", void 0);
    __decorate([
        Input('aria-labelledby'),
        __metadata("design:type", String)
    ], _MatMenuBase.prototype, "ariaLabelledby", void 0);
    __decorate([
        Input('aria-describedby'),
        __metadata("design:type", String)
    ], _MatMenuBase.prototype, "ariaDescribedby", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String),
        __metadata("design:paramtypes", [String])
    ], _MatMenuBase.prototype, "xPosition", null);
    __decorate([
        Input(),
        __metadata("design:type", String),
        __metadata("design:paramtypes", [String])
    ], _MatMenuBase.prototype, "yPosition", null);
    __decorate([
        ViewChild(TemplateRef),
        __metadata("design:type", TemplateRef)
    ], _MatMenuBase.prototype, "templateRef", void 0);
    __decorate([
        ContentChildren(MatMenuItem, { descendants: false }),
        __metadata("design:type", QueryList)
    ], _MatMenuBase.prototype, "items", void 0);
    __decorate([
        ContentChild(MatMenuContent),
        __metadata("design:type", MatMenuContent)
    ], _MatMenuBase.prototype, "lazyContent", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], _MatMenuBase.prototype, "overlapTrigger", null);
    __decorate([
        Input(),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], _MatMenuBase.prototype, "hasBackdrop", null);
    __decorate([
        Input('class'),
        __metadata("design:type", String),
        __metadata("design:paramtypes", [String])
    ], _MatMenuBase.prototype, "panelClass", null);
    __decorate([
        Input(),
        __metadata("design:type", String),
        __metadata("design:paramtypes", [String])
    ], _MatMenuBase.prototype, "classList", null);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], _MatMenuBase.prototype, "closed", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], _MatMenuBase.prototype, "close", void 0);
    _MatMenuBase = __decorate([
        Directive()
        // tslint:disable-next-line:class-name
        ,
        __param(2, Inject(MAT_MENU_DEFAULT_OPTIONS)),
        __metadata("design:paramtypes", [ElementRef,
            NgZone, Object])
    ], _MatMenuBase);
    return _MatMenuBase;
})();
/** @docs-private We show the "_MatMenu" class as "MatMenu" in the docs. */
let MatMenu = /** @class */ (() => {
    let MatMenu = class MatMenu extends _MatMenuBase {
    };
    MatMenu = __decorate([
        Directive()
    ], MatMenu);
    return MatMenu;
})();
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
    var _MatMenu_1;
    let _MatMenu = _MatMenu_1 = 
    // tslint:disable-next-line:class-name
    class _MatMenu extends MatMenu {
        constructor(elementRef, ngZone, defaultOptions) {
            super(elementRef, ngZone, defaultOptions);
        }
    };
    _MatMenu = _MatMenu_1 = __decorate([
        Component({
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
                { provide: MatMenu, useExisting: _MatMenu_1 }
            ],
            styles: [".mat-menu-panel{min-width:112px;max-width:280px;overflow:auto;-webkit-overflow-scrolling:touch;max-height:calc(100vh - 48px);border-radius:4px;outline:0;min-height:64px}.mat-menu-panel.ng-animating{pointer-events:none}.cdk-high-contrast-active .mat-menu-panel{outline:solid 1px}.mat-menu-content:not(:empty){padding-top:8px;padding-bottom:8px}.mat-menu-item{-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;user-select:none;cursor:pointer;outline:none;border:none;-webkit-tap-highlight-color:transparent;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:block;line-height:48px;height:48px;padding:0 16px;text-align:left;text-decoration:none;max-width:100%;position:relative}.mat-menu-item::-moz-focus-inner{border:0}.mat-menu-item[disabled]{cursor:default}[dir=rtl] .mat-menu-item{text-align:right}.mat-menu-item .mat-icon{margin-right:16px;vertical-align:middle}.mat-menu-item .mat-icon svg{vertical-align:top}[dir=rtl] .mat-menu-item .mat-icon{margin-left:16px;margin-right:0}.mat-menu-item[disabled]{pointer-events:none}.cdk-high-contrast-active .mat-menu-item.cdk-program-focused,.cdk-high-contrast-active .mat-menu-item.cdk-keyboard-focused,.cdk-high-contrast-active .mat-menu-item-highlighted{outline:dotted 1px}.mat-menu-item-submenu-trigger{padding-right:32px}.mat-menu-item-submenu-trigger::after{width:0;height:0;border-style:solid;border-width:5px 0 5px 5px;border-color:transparent transparent transparent currentColor;content:\"\";display:inline-block;position:absolute;top:50%;right:16px;transform:translateY(-50%)}[dir=rtl] .mat-menu-item-submenu-trigger{padding-right:16px;padding-left:32px}[dir=rtl] .mat-menu-item-submenu-trigger::after{right:auto;left:16px;transform:rotateY(180deg) translateY(-50%)}button.mat-menu-item{width:100%}.mat-menu-item .mat-menu-ripple{top:0;left:0;right:0;bottom:0;position:absolute;pointer-events:none}\n"]
        })
        // tslint:disable-next-line:class-name
        ,
        __param(2, Inject(MAT_MENU_DEFAULT_OPTIONS)),
        __metadata("design:paramtypes", [ElementRef, NgZone, Object])
    ], _MatMenu);
    return _MatMenu;
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/** Injection token that determines the scroll handling while the menu is open. */
const MAT_MENU_SCROLL_STRATEGY = new InjectionToken('mat-menu-scroll-strategy');
/** @docs-private */
function MAT_MENU_SCROLL_STRATEGY_FACTORY(overlay) {
    return () => overlay.scrollStrategies.reposition();
}
/** @docs-private */
const MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER = {
    provide: MAT_MENU_SCROLL_STRATEGY,
    deps: [Overlay],
    useFactory: MAT_MENU_SCROLL_STRATEGY_FACTORY,
};
/** Default top padding of the menu panel. */
const MENU_PANEL_TOP_PADDING = 8;
/** Options for binding a passive event listener. */
const passiveEventListenerOptions = normalizePassiveListenerOptions({ passive: true });
// TODO(andrewseguin): Remove the kebab versions in favor of camelCased attribute selectors
/** Directive applied to an element that should trigger a `mat-menu`. */
let MatMenuTrigger = /** @class */ (() => {
    let MatMenuTrigger = class MatMenuTrigger {
        constructor(_overlay, _element, _viewContainerRef, scrollStrategy, _parentMenu, _menuItemInstance, _dir, 
        // TODO(crisbeto): make the _focusMonitor required when doing breaking changes.
        // @breaking-change 8.0.0
        _focusMonitor) {
            this._overlay = _overlay;
            this._element = _element;
            this._viewContainerRef = _viewContainerRef;
            this._parentMenu = _parentMenu;
            this._menuItemInstance = _menuItemInstance;
            this._dir = _dir;
            this._focusMonitor = _focusMonitor;
            this._overlayRef = null;
            this._menuOpen = false;
            this._closingActionsSubscription = Subscription.EMPTY;
            this._hoverSubscription = Subscription.EMPTY;
            this._menuCloseSubscription = Subscription.EMPTY;
            /**
             * Handles touch start events on the trigger.
             * Needs to be an arrow function so we can easily use addEventListener and removeEventListener.
             */
            this._handleTouchStart = () => this._openedBy = 'touch';
            // Tracking input type is necessary so it's possible to only auto-focus
            // the first item of the list when the menu is opened via the keyboard
            this._openedBy = null;
            /**
             * Whether focus should be restored when the menu is closed.
             * Note that disabling this option can have accessibility implications
             * and it's up to you to manage focus, if you decide to turn it off.
             */
            this.restoreFocus = true;
            /** Event emitted when the associated menu is opened. */
            this.menuOpened = new EventEmitter();
            /**
             * Event emitted when the associated menu is opened.
             * @deprecated Switch to `menuOpened` instead
             * @breaking-change 8.0.0
             */
            // tslint:disable-next-line:no-output-on-prefix
            this.onMenuOpen = this.menuOpened;
            /** Event emitted when the associated menu is closed. */
            this.menuClosed = new EventEmitter();
            /**
             * Event emitted when the associated menu is closed.
             * @deprecated Switch to `menuClosed` instead
             * @breaking-change 8.0.0
             */
            // tslint:disable-next-line:no-output-on-prefix
            this.onMenuClose = this.menuClosed;
            _element.nativeElement.addEventListener('touchstart', this._handleTouchStart, passiveEventListenerOptions);
            if (_menuItemInstance) {
                _menuItemInstance._triggersSubmenu = this.triggersSubmenu();
            }
            this._scrollStrategy = scrollStrategy;
        }
        /**
         * @deprecated
         * @breaking-change 8.0.0
         */
        get _deprecatedMatMenuTriggerFor() { return this.menu; }
        set _deprecatedMatMenuTriggerFor(v) {
            this.menu = v;
        }
        /** References the menu instance that the trigger is associated with. */
        get menu() { return this._menu; }
        set menu(menu) {
            if (menu === this._menu) {
                return;
            }
            this._menu = menu;
            this._menuCloseSubscription.unsubscribe();
            if (menu) {
                this._menuCloseSubscription = menu.close.asObservable().subscribe(reason => {
                    this._destroyMenu();
                    // If a click closed the menu, we should close the entire chain of nested menus.
                    if ((reason === 'click' || reason === 'tab') && this._parentMenu) {
                        this._parentMenu.closed.emit(reason);
                    }
                });
            }
        }
        ngAfterContentInit() {
            this._checkMenu();
            this._handleHover();
        }
        ngOnDestroy() {
            if (this._overlayRef) {
                this._overlayRef.dispose();
                this._overlayRef = null;
            }
            this._element.nativeElement.removeEventListener('touchstart', this._handleTouchStart, passiveEventListenerOptions);
            this._menuCloseSubscription.unsubscribe();
            this._closingActionsSubscription.unsubscribe();
            this._hoverSubscription.unsubscribe();
        }
        /** Whether the menu is open. */
        get menuOpen() {
            return this._menuOpen;
        }
        /** The text direction of the containing app. */
        get dir() {
            return this._dir && this._dir.value === 'rtl' ? 'rtl' : 'ltr';
        }
        /** Whether the menu triggers a sub-menu or a top-level one. */
        triggersSubmenu() {
            return !!(this._menuItemInstance && this._parentMenu);
        }
        /** Toggles the menu between the open and closed states. */
        toggleMenu() {
            return this._menuOpen ? this.closeMenu() : this.openMenu();
        }
        /** Opens the menu. */
        openMenu() {
            if (this._menuOpen) {
                return;
            }
            this._checkMenu();
            const overlayRef = this._createOverlay();
            const overlayConfig = overlayRef.getConfig();
            this._setPosition(overlayConfig.positionStrategy);
            overlayConfig.hasBackdrop = this.menu.hasBackdrop == null ? !this.triggersSubmenu() :
                this.menu.hasBackdrop;
            overlayRef.attach(this._getPortal());
            if (this.menu.lazyContent) {
                this.menu.lazyContent.attach(this.menuData);
            }
            this._closingActionsSubscription = this._menuClosingActions().subscribe(() => this.closeMenu());
            this._initMenu();
            if (this.menu instanceof MatMenu) {
                this.menu._startAnimation();
            }
        }
        /** Closes the menu. */
        closeMenu() {
            this.menu.close.emit();
        }
        /**
         * Focuses the menu trigger.
         * @param origin Source of the menu trigger's focus.
         */
        focus(origin = 'program', options) {
            if (this._focusMonitor) {
                this._focusMonitor.focusVia(this._element, origin, options);
            }
            else {
                this._element.nativeElement.focus(options);
            }
        }
        /** Closes the menu and does the necessary cleanup. */
        _destroyMenu() {
            if (!this._overlayRef || !this.menuOpen) {
                return;
            }
            const menu = this.menu;
            this._closingActionsSubscription.unsubscribe();
            this._overlayRef.detach();
            this._restoreFocus();
            if (menu instanceof MatMenu) {
                menu._resetAnimation();
                if (menu.lazyContent) {
                    // Wait for the exit animation to finish before detaching the content.
                    menu._animationDone
                        .pipe(filter(event => event.toState === 'void'), take(1), 
                    // Interrupt if the content got re-attached.
                    takeUntil(menu.lazyContent._attached))
                        .subscribe({
                        next: () => menu.lazyContent.detach(),
                        // No matter whether the content got re-attached, reset the menu.
                        complete: () => this._setIsMenuOpen(false)
                    });
                }
                else {
                    this._setIsMenuOpen(false);
                }
            }
            else {
                this._setIsMenuOpen(false);
                if (menu.lazyContent) {
                    menu.lazyContent.detach();
                }
            }
        }
        /**
         * This method sets the menu state to open and focuses the first item if
         * the menu was opened via the keyboard.
         */
        _initMenu() {
            this.menu.parentMenu = this.triggersSubmenu() ? this._parentMenu : undefined;
            this.menu.direction = this.dir;
            this._setMenuElevation();
            this._setIsMenuOpen(true);
            this.menu.focusFirstItem(this._openedBy || 'program');
        }
        /** Updates the menu elevation based on the amount of parent menus that it has. */
        _setMenuElevation() {
            if (this.menu.setElevation) {
                let depth = 0;
                let parentMenu = this.menu.parentMenu;
                while (parentMenu) {
                    depth++;
                    parentMenu = parentMenu.parentMenu;
                }
                this.menu.setElevation(depth);
            }
        }
        /** Restores focus to the element that was focused before the menu was open. */
        _restoreFocus() {
            // We should reset focus if the user is navigating using a keyboard or
            // if we have a top-level trigger which might cause focus to be lost
            // when clicking on the backdrop.
            if (this.restoreFocus) {
                if (!this._openedBy) {
                    // Note that the focus style will show up both for `program` and
                    // `keyboard` so we don't have to specify which one it is.
                    this.focus();
                }
                else if (!this.triggersSubmenu()) {
                    this.focus(this._openedBy);
                }
            }
            this._openedBy = null;
        }
        // set state rather than toggle to support triggers sharing a menu
        _setIsMenuOpen(isOpen) {
            this._menuOpen = isOpen;
            this._menuOpen ? this.menuOpened.emit() : this.menuClosed.emit();
            if (this.triggersSubmenu()) {
                this._menuItemInstance._highlighted = isOpen;
            }
        }
        /**
         * This method checks that a valid instance of MatMenu has been passed into
         * matMenuTriggerFor. If not, an exception is thrown.
         */
        _checkMenu() {
            if (!this.menu) {
                throwMatMenuMissingError();
            }
        }
        /**
         * This method creates the overlay from the provided menu's template and saves its
         * OverlayRef so that it can be attached to the DOM when openMenu is called.
         */
        _createOverlay() {
            if (!this._overlayRef) {
                const config = this._getOverlayConfig();
                this._subscribeToPositions(config.positionStrategy);
                this._overlayRef = this._overlay.create(config);
                // Consume the `keydownEvents` in order to prevent them from going to another overlay.
                // Ideally we'd also have our keyboard event logic in here, however doing so will
                // break anybody that may have implemented the `MatMenuPanel` themselves.
                this._overlayRef.keydownEvents().subscribe();
            }
            return this._overlayRef;
        }
        /**
         * This method builds the configuration object needed to create the overlay, the OverlayState.
         * @returns OverlayConfig
         */
        _getOverlayConfig() {
            return new OverlayConfig({
                positionStrategy: this._overlay.position()
                    .flexibleConnectedTo(this._element)
                    .withLockedPosition()
                    .withTransformOriginOn('.mat-menu-panel, .mat-mdc-menu-panel'),
                backdropClass: this.menu.backdropClass || 'cdk-overlay-transparent-backdrop',
                scrollStrategy: this._scrollStrategy(),
                direction: this._dir
            });
        }
        /**
         * Listens to changes in the position of the overlay and sets the correct classes
         * on the menu based on the new position. This ensures the animation origin is always
         * correct, even if a fallback position is used for the overlay.
         */
        _subscribeToPositions(position) {
            if (this.menu.setPositionClasses) {
                position.positionChanges.subscribe(change => {
                    const posX = change.connectionPair.overlayX === 'start' ? 'after' : 'before';
                    const posY = change.connectionPair.overlayY === 'top' ? 'below' : 'above';
                    this.menu.setPositionClasses(posX, posY);
                });
            }
        }
        /**
         * Sets the appropriate positions on a position strategy
         * so the overlay connects with the trigger correctly.
         * @param positionStrategy Strategy whose position to update.
         */
        _setPosition(positionStrategy) {
            let [originX, originFallbackX] = this.menu.xPosition === 'before' ? ['end', 'start'] : ['start', 'end'];
            let [overlayY, overlayFallbackY] = this.menu.yPosition === 'above' ? ['bottom', 'top'] : ['top', 'bottom'];
            let [originY, originFallbackY] = [overlayY, overlayFallbackY];
            let [overlayX, overlayFallbackX] = [originX, originFallbackX];
            let offsetY = 0;
            if (this.triggersSubmenu()) {
                // When the menu is a sub-menu, it should always align itself
                // to the edges of the trigger, instead of overlapping it.
                overlayFallbackX = originX = this.menu.xPosition === 'before' ? 'start' : 'end';
                originFallbackX = overlayX = originX === 'end' ? 'start' : 'end';
                offsetY = overlayY === 'bottom' ? MENU_PANEL_TOP_PADDING : -MENU_PANEL_TOP_PADDING;
            }
            else if (!this.menu.overlapTrigger) {
                originY = overlayY === 'top' ? 'bottom' : 'top';
                originFallbackY = overlayFallbackY === 'top' ? 'bottom' : 'top';
            }
            positionStrategy.withPositions([
                { originX, originY, overlayX, overlayY, offsetY },
                { originX: originFallbackX, originY, overlayX: overlayFallbackX, overlayY, offsetY },
                {
                    originX,
                    originY: originFallbackY,
                    overlayX,
                    overlayY: overlayFallbackY,
                    offsetY: -offsetY
                },
                {
                    originX: originFallbackX,
                    originY: originFallbackY,
                    overlayX: overlayFallbackX,
                    overlayY: overlayFallbackY,
                    offsetY: -offsetY
                }
            ]);
        }
        /** Returns a stream that emits whenever an action that should close the menu occurs. */
        _menuClosingActions() {
            const backdrop = this._overlayRef.backdropClick();
            const detachments = this._overlayRef.detachments();
            const parentClose = this._parentMenu ? this._parentMenu.closed : of();
            const hover = this._parentMenu ? this._parentMenu._hovered().pipe(filter(active => active !== this._menuItemInstance), filter(() => this._menuOpen)) : of();
            return merge(backdrop, parentClose, hover, detachments);
        }
        /** Handles mouse presses on the trigger. */
        _handleMousedown(event) {
            if (!isFakeMousedownFromScreenReader(event)) {
                // Since right or middle button clicks won't trigger the `click` event,
                // we shouldn't consider the menu as opened by mouse in those cases.
                this._openedBy = event.button === 0 ? 'mouse' : null;
                // Since clicking on the trigger won't close the menu if it opens a sub-menu,
                // we should prevent focus from moving onto it via click to avoid the
                // highlight from lingering on the menu item.
                if (this.triggersSubmenu()) {
                    event.preventDefault();
                }
            }
        }
        /** Handles key presses on the trigger. */
        _handleKeydown(event) {
            const keyCode = event.keyCode;
            if (this.triggersSubmenu() && ((keyCode === RIGHT_ARROW && this.dir === 'ltr') ||
                (keyCode === LEFT_ARROW && this.dir === 'rtl'))) {
                this.openMenu();
            }
        }
        /** Handles click events on the trigger. */
        _handleClick(event) {
            if (this.triggersSubmenu()) {
                // Stop event propagation to avoid closing the parent menu.
                event.stopPropagation();
                this.openMenu();
            }
            else {
                this.toggleMenu();
            }
        }
        /** Handles the cases where the user hovers over the trigger. */
        _handleHover() {
            // Subscribe to changes in the hovered item in order to toggle the panel.
            if (!this.triggersSubmenu()) {
                return;
            }
            this._hoverSubscription = this._parentMenu._hovered()
                // Since we might have multiple competing triggers for the same menu (e.g. a sub-menu
                // with different data and triggers), we have to delay it by a tick to ensure that
                // it won't be closed immediately after it is opened.
                .pipe(filter(active => active === this._menuItemInstance && !active.disabled), delay(0, asapScheduler))
                .subscribe(() => {
                this._openedBy = 'mouse';
                // If the same menu is used between multiple triggers, it might still be animating
                // while the new trigger tries to re-open it. Wait for the animation to finish
                // before doing so. Also interrupt if the user moves to another item.
                if (this.menu instanceof MatMenu && this.menu._isAnimating) {
                    // We need the `delay(0)` here in order to avoid
                    // 'changed after checked' errors in some cases. See #12194.
                    this.menu._animationDone
                        .pipe(take(1), delay(0, asapScheduler), takeUntil(this._parentMenu._hovered()))
                        .subscribe(() => this.openMenu());
                }
                else {
                    this.openMenu();
                }
            });
        }
        /** Gets the portal that should be attached to the overlay. */
        _getPortal() {
            // Note that we can avoid this check by keeping the portal on the menu panel.
            // While it would be cleaner, we'd have to introduce another required method on
            // `MatMenuPanel`, making it harder to consume.
            if (!this._portal || this._portal.templateRef !== this.menu.templateRef) {
                this._portal = new TemplatePortal(this.menu.templateRef, this._viewContainerRef);
            }
            return this._portal;
        }
    };
    __decorate([
        Input('mat-menu-trigger-for'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], MatMenuTrigger.prototype, "_deprecatedMatMenuTriggerFor", null);
    __decorate([
        Input('matMenuTriggerFor'),
        __metadata("design:type", Object),
        __metadata("design:paramtypes", [Object])
    ], MatMenuTrigger.prototype, "menu", null);
    __decorate([
        Input('matMenuTriggerData'),
        __metadata("design:type", Object)
    ], MatMenuTrigger.prototype, "menuData", void 0);
    __decorate([
        Input('matMenuTriggerRestoreFocus'),
        __metadata("design:type", Boolean)
    ], MatMenuTrigger.prototype, "restoreFocus", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], MatMenuTrigger.prototype, "menuOpened", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], MatMenuTrigger.prototype, "onMenuOpen", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], MatMenuTrigger.prototype, "menuClosed", void 0);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], MatMenuTrigger.prototype, "onMenuClose", void 0);
    MatMenuTrigger = __decorate([
        Directive({
            selector: `[mat-menu-trigger-for], [matMenuTriggerFor]`,
            host: {
                'class': 'mat-menu-trigger',
                'aria-haspopup': 'true',
                '[attr.aria-expanded]': 'menuOpen || null',
                '[attr.aria-controls]': 'menuOpen ? menu.panelId : null',
                '(mousedown)': '_handleMousedown($event)',
                '(keydown)': '_handleKeydown($event)',
                '(click)': '_handleClick($event)',
            },
            exportAs: 'matMenuTrigger'
        }),
        __param(3, Inject(MAT_MENU_SCROLL_STRATEGY)),
        __param(4, Optional()),
        __param(5, Optional()), __param(5, Self()),
        __param(6, Optional()),
        __metadata("design:paramtypes", [Overlay,
            ElementRef,
            ViewContainerRef, Object, MatMenu,
            MatMenuItem,
            Directionality,
            FocusMonitor])
    ], MatMenuTrigger);
    return MatMenuTrigger;
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Used by both the current `MatMenuModule` and the MDC `MatMenuModule`
 * to declare the menu-related directives.
 */
let _MatMenuDirectivesModule = /** @class */ (() => {
    let _MatMenuDirectivesModule = 
    // tslint:disable-next-line:class-name
    class _MatMenuDirectivesModule {
    };
    _MatMenuDirectivesModule = __decorate([
        NgModule({
            exports: [MatMenuTrigger, MatMenuContent, MatCommonModule],
            declarations: [
                MatMenuTrigger,
                MatMenuContent,
            ],
            providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER]
        })
        // tslint:disable-next-line:class-name
    ], _MatMenuDirectivesModule);
    return _MatMenuDirectivesModule;
})();
let MatMenuModule = /** @class */ (() => {
    let MatMenuModule = class MatMenuModule {
    };
    MatMenuModule = __decorate([
        NgModule({
            imports: [
                CommonModule,
                MatCommonModule,
                MatRippleModule,
                OverlayModule,
                _MatMenuDirectivesModule,
            ],
            exports: [CdkScrollableModule, MatCommonModule, _MatMenu, MatMenuItem, _MatMenuDirectivesModule],
            declarations: [_MatMenu, MatMenuItem],
            providers: [MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER]
        })
    ], MatMenuModule);
    return MatMenuModule;
})();

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

/**
 * Generated bundle index. Do not edit.
 */

export { MAT_MENU_DEFAULT_OPTIONS, MAT_MENU_PANEL, MAT_MENU_SCROLL_STRATEGY, MatMenu, MatMenuContent, MatMenuItem, MatMenuModule, MatMenuTrigger, _MatMenu, _MatMenuBase, _MatMenuDirectivesModule, fadeInItems, matMenuAnimations, transformMenu, MAT_MENU_DEFAULT_OPTIONS_FACTORY as ɵangular_material_src_material_menu_menu_a, MAT_MENU_SCROLL_STRATEGY_FACTORY as ɵangular_material_src_material_menu_menu_b, MAT_MENU_SCROLL_STRATEGY_FACTORY_PROVIDER as ɵangular_material_src_material_menu_menu_c };
//# sourceMappingURL=menu.js.map
