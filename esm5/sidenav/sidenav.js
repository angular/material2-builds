/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import * as tslib_1 from "tslib";
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ContentChild, ContentChildren, forwardRef, Inject, Input, ViewEncapsulation, QueryList, ElementRef, NgZone, } from '@angular/core';
import { MatDrawer, MatDrawerContainer, MatDrawerContent } from './drawer';
import { matDrawerAnimations } from './drawer-animations';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { ScrollDispatcher } from '@angular/cdk/scrolling';
var MatSidenavContent = /** @class */ (function (_super) {
    tslib_1.__extends(MatSidenavContent, _super);
    function MatSidenavContent(changeDetectorRef, container, elementRef, scrollDispatcher, ngZone) {
        return _super.call(this, changeDetectorRef, container, elementRef, scrollDispatcher, ngZone) || this;
    }
    MatSidenavContent.decorators = [
        { type: Component, args: [{
                    moduleId: module.id,
                    selector: 'mat-sidenav-content',
                    template: '<ng-content></ng-content>',
                    host: {
                        'class': 'mat-drawer-content mat-sidenav-content',
                        '[style.margin-left.px]': '_container._contentMargins.left',
                        '[style.margin-right.px]': '_container._contentMargins.right',
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None
                }] }
    ];
    /** @nocollapse */
    MatSidenavContent.ctorParameters = function () { return [
        { type: ChangeDetectorRef },
        { type: MatSidenavContainer, decorators: [{ type: Inject, args: [forwardRef(function () { return MatSidenavContainer; }),] }] },
        { type: ElementRef },
        { type: ScrollDispatcher },
        { type: NgZone }
    ]; };
    return MatSidenavContent;
}(MatDrawerContent));
export { MatSidenavContent };
var MatSidenav = /** @class */ (function (_super) {
    tslib_1.__extends(MatSidenav, _super);
    function MatSidenav() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._fixedInViewport = false;
        _this._fixedTopGap = 0;
        _this._fixedBottomGap = 0;
        return _this;
    }
    Object.defineProperty(MatSidenav.prototype, "fixedInViewport", {
        /** Whether the sidenav is fixed in the viewport. */
        get: function () { return this._fixedInViewport; },
        set: function (value) { this._fixedInViewport = coerceBooleanProperty(value); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MatSidenav.prototype, "fixedTopGap", {
        /**
         * The gap between the top of the sidenav and the top of the viewport when the sidenav is in fixed
         * mode.
         */
        get: function () { return this._fixedTopGap; },
        set: function (value) { this._fixedTopGap = coerceNumberProperty(value); },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(MatSidenav.prototype, "fixedBottomGap", {
        /**
         * The gap between the bottom of the sidenav and the bottom of the viewport when the sidenav is in
         * fixed mode.
         */
        get: function () { return this._fixedBottomGap; },
        set: function (value) { this._fixedBottomGap = coerceNumberProperty(value); },
        enumerable: true,
        configurable: true
    });
    MatSidenav.decorators = [
        { type: Component, args: [{
                    moduleId: module.id,
                    selector: 'mat-sidenav',
                    exportAs: 'matSidenav',
                    template: "<div class=\"mat-drawer-inner-container\">\r\n  <ng-content></ng-content>\r\n</div>\r\n",
                    animations: [matDrawerAnimations.transformDrawer],
                    host: {
                        'class': 'mat-drawer mat-sidenav',
                        'tabIndex': '-1',
                        // must prevent the browser from aligning text based on value
                        '[attr.align]': 'null',
                        '[class.mat-drawer-end]': 'position === "end"',
                        '[class.mat-drawer-over]': 'mode === "over"',
                        '[class.mat-drawer-push]': 'mode === "push"',
                        '[class.mat-drawer-side]': 'mode === "side"',
                        '[class.mat-drawer-opened]': 'opened',
                        '[class.mat-sidenav-fixed]': 'fixedInViewport',
                        '[style.top.px]': 'fixedInViewport ? fixedTopGap : null',
                        '[style.bottom.px]': 'fixedInViewport ? fixedBottomGap : null',
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None
                }] }
    ];
    MatSidenav.propDecorators = {
        fixedInViewport: [{ type: Input }],
        fixedTopGap: [{ type: Input }],
        fixedBottomGap: [{ type: Input }]
    };
    return MatSidenav;
}(MatDrawer));
export { MatSidenav };
var MatSidenavContainer = /** @class */ (function (_super) {
    tslib_1.__extends(MatSidenavContainer, _super);
    function MatSidenavContainer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    MatSidenavContainer.decorators = [
        { type: Component, args: [{
                    moduleId: module.id,
                    selector: 'mat-sidenav-container',
                    exportAs: 'matSidenavContainer',
                    template: "<div class=\"mat-drawer-backdrop\" (click)=\"_onBackdropClicked()\" *ngIf=\"hasBackdrop\"\n     [class.mat-drawer-shown]=\"_isShowingBackdrop()\"></div>\n\n<ng-content select=\"mat-sidenav\"></ng-content>\n\n<ng-content select=\"mat-sidenav-content\">\n</ng-content>\n<mat-sidenav-content *ngIf=\"!_content\" cdkScrollable>\n  <ng-content></ng-content>\n</mat-sidenav-content>\n",
                    host: {
                        'class': 'mat-drawer-container mat-sidenav-container',
                        '[class.mat-drawer-container-explicit-backdrop]': '_backdropOverride',
                    },
                    changeDetection: ChangeDetectionStrategy.OnPush,
                    encapsulation: ViewEncapsulation.None,
                    styles: [".mat-drawer-container{position:relative;z-index:1;box-sizing:border-box;-webkit-overflow-scrolling:touch;display:block;overflow:hidden}.mat-drawer-container[fullscreen]{top:0;left:0;right:0;bottom:0;position:absolute}.mat-drawer-container[fullscreen].mat-drawer-container-has-open{overflow:hidden}.mat-drawer-container.mat-drawer-container-explicit-backdrop .mat-drawer-side{z-index:3}.mat-drawer-container.ng-animate-disabled .mat-drawer-backdrop,.mat-drawer-container.ng-animate-disabled .mat-drawer-content,.ng-animate-disabled .mat-drawer-container .mat-drawer-backdrop,.ng-animate-disabled .mat-drawer-container .mat-drawer-content{transition:none}.mat-drawer-backdrop{top:0;left:0;right:0;bottom:0;position:absolute;display:block;z-index:3;visibility:hidden}.mat-drawer-backdrop.mat-drawer-shown{visibility:visible}.mat-drawer-transition .mat-drawer-backdrop{transition-duration:400ms;transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1);transition-property:background-color,visibility}@media(-ms-high-contrast: active){.mat-drawer-backdrop{opacity:.5}}.mat-drawer-content{position:relative;z-index:1;display:block;height:100%;overflow:auto}.mat-drawer-transition .mat-drawer-content{transition-duration:400ms;transition-timing-function:cubic-bezier(0.25, 0.8, 0.25, 1);transition-property:transform,margin-left,margin-right}.mat-drawer{position:relative;z-index:4;display:block;position:absolute;top:0;bottom:0;z-index:3;outline:0;box-sizing:border-box;overflow-y:auto;transform:translate3d(-100%, 0, 0)}@media(-ms-high-contrast: active){.mat-drawer,[dir=rtl] .mat-drawer.mat-drawer-end{border-right:solid 1px currentColor}}@media(-ms-high-contrast: active){[dir=rtl] .mat-drawer,.mat-drawer.mat-drawer-end{border-left:solid 1px currentColor;border-right:none}}.mat-drawer.mat-drawer-side{z-index:2}.mat-drawer.mat-drawer-end{right:0;transform:translate3d(100%, 0, 0)}[dir=rtl] .mat-drawer{transform:translate3d(100%, 0, 0)}[dir=rtl] .mat-drawer.mat-drawer-end{left:0;right:auto;transform:translate3d(-100%, 0, 0)}.mat-drawer-inner-container{width:100%;height:100%;overflow:auto;-webkit-overflow-scrolling:touch}.mat-sidenav-fixed{position:fixed}/*# sourceMappingURL=drawer.css.map */\n"]
                }] }
    ];
    MatSidenavContainer.propDecorators = {
        _drawers: [{ type: ContentChildren, args: [MatSidenav,] }],
        _content: [{ type: ContentChild, args: [MatSidenavContent, { static: false },] }]
    };
    return MatSidenavContainer;
}(MatDrawerContainer));
export { MatSidenavContainer };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZW5hdi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9zaWRlbmF2L3NpZGVuYXYudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFDTCx1QkFBdUIsRUFDdkIsaUJBQWlCLEVBQ2pCLFNBQVMsRUFDVCxZQUFZLEVBQ1osZUFBZSxFQUNmLFVBQVUsRUFDVixNQUFNLEVBQ04sS0FBSyxFQUNMLGlCQUFpQixFQUNqQixTQUFTLEVBQ1QsVUFBVSxFQUNWLE1BQU0sR0FDUCxNQUFNLGVBQWUsQ0FBQztBQUN2QixPQUFPLEVBQUMsU0FBUyxFQUFFLGtCQUFrQixFQUFFLGdCQUFnQixFQUFDLE1BQU0sVUFBVSxDQUFDO0FBQ3pFLE9BQU8sRUFBQyxtQkFBbUIsRUFBQyxNQUFNLHFCQUFxQixDQUFDO0FBQ3hELE9BQU8sRUFBQyxxQkFBcUIsRUFBRSxvQkFBb0IsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ2xGLE9BQU8sRUFBQyxnQkFBZ0IsRUFBQyxNQUFNLHdCQUF3QixDQUFDO0FBR3hEO0lBWXVDLDZDQUFnQjtJQUNyRCwyQkFDSSxpQkFBb0MsRUFDVyxTQUE4QixFQUM3RSxVQUFtQyxFQUNuQyxnQkFBa0MsRUFDbEMsTUFBYztlQUNoQixrQkFBTSxpQkFBaUIsRUFBRSxTQUFTLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLE1BQU0sQ0FBQztJQUMzRSxDQUFDOztnQkFwQkYsU0FBUyxTQUFDO29CQUNULFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRTtvQkFDbkIsUUFBUSxFQUFFLHFCQUFxQjtvQkFDL0IsUUFBUSxFQUFFLDJCQUEyQjtvQkFDckMsSUFBSSxFQUFFO3dCQUNKLE9BQU8sRUFBRSx3Q0FBd0M7d0JBQ2pELHdCQUF3QixFQUFFLGlDQUFpQzt3QkFDM0QseUJBQXlCLEVBQUUsa0NBQWtDO3FCQUM5RDtvQkFDRCxl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dEM7OzsyQkFFRSxlQUFlLFNBQUMsVUFBVTsyQkFDMUIsWUFBWSxTQUFDLGlCQUFpQixFQUFFLEVBQUMsTUFBTSxFQUFFLEtBQUssRUFBQzs7SUFDbEQsMEJBQUM7Q0FBQSxBQWhCRCxDQWF5QyxrQkFBa0IsR0FHMUQ7U0FIWSxtQkFBbUIiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtcbiAgQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3ksXG4gIENoYW5nZURldGVjdG9yUmVmLFxuICBDb21wb25lbnQsXG4gIENvbnRlbnRDaGlsZCxcbiAgQ29udGVudENoaWxkcmVuLFxuICBmb3J3YXJkUmVmLFxuICBJbmplY3QsXG4gIElucHV0LFxuICBWaWV3RW5jYXBzdWxhdGlvbixcbiAgUXVlcnlMaXN0LFxuICBFbGVtZW50UmVmLFxuICBOZ1pvbmUsXG59IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuaW1wb3J0IHtNYXREcmF3ZXIsIE1hdERyYXdlckNvbnRhaW5lciwgTWF0RHJhd2VyQ29udGVudH0gZnJvbSAnLi9kcmF3ZXInO1xuaW1wb3J0IHttYXREcmF3ZXJBbmltYXRpb25zfSBmcm9tICcuL2RyYXdlci1hbmltYXRpb25zJztcbmltcG9ydCB7Y29lcmNlQm9vbGVhblByb3BlcnR5LCBjb2VyY2VOdW1iZXJQcm9wZXJ0eX0gZnJvbSAnQGFuZ3VsYXIvY2RrL2NvZXJjaW9uJztcbmltcG9ydCB7U2Nyb2xsRGlzcGF0Y2hlcn0gZnJvbSAnQGFuZ3VsYXIvY2RrL3Njcm9sbGluZyc7XG5cblxuQENvbXBvbmVudCh7XG4gIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gIHNlbGVjdG9yOiAnbWF0LXNpZGVuYXYtY29udGVudCcsXG4gIHRlbXBsYXRlOiAnPG5nLWNvbnRlbnQ+PC9uZy1jb250ZW50PicsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LWRyYXdlci1jb250ZW50IG1hdC1zaWRlbmF2LWNvbnRlbnQnLFxuICAgICdbc3R5bGUubWFyZ2luLWxlZnQucHhdJzogJ19jb250YWluZXIuX2NvbnRlbnRNYXJnaW5zLmxlZnQnLFxuICAgICdbc3R5bGUubWFyZ2luLXJpZ2h0LnB4XSc6ICdfY29udGFpbmVyLl9jb250ZW50TWFyZ2lucy5yaWdodCcsXG4gIH0sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRTaWRlbmF2Q29udGVudCBleHRlbmRzIE1hdERyYXdlckNvbnRlbnQge1xuICBjb25zdHJ1Y3RvcihcbiAgICAgIGNoYW5nZURldGVjdG9yUmVmOiBDaGFuZ2VEZXRlY3RvclJlZixcbiAgICAgIEBJbmplY3QoZm9yd2FyZFJlZigoKSA9PiBNYXRTaWRlbmF2Q29udGFpbmVyKSkgY29udGFpbmVyOiBNYXRTaWRlbmF2Q29udGFpbmVyLFxuICAgICAgZWxlbWVudFJlZjogRWxlbWVudFJlZjxIVE1MRWxlbWVudD4sXG4gICAgICBzY3JvbGxEaXNwYXRjaGVyOiBTY3JvbGxEaXNwYXRjaGVyLFxuICAgICAgbmdab25lOiBOZ1pvbmUpIHtcbiAgICBzdXBlcihjaGFuZ2VEZXRlY3RvclJlZiwgY29udGFpbmVyLCBlbGVtZW50UmVmLCBzY3JvbGxEaXNwYXRjaGVyLCBuZ1pvbmUpO1xuICB9XG59XG5cblxuQENvbXBvbmVudCh7XG4gIG1vZHVsZUlkOiBtb2R1bGUuaWQsXG4gIHNlbGVjdG9yOiAnbWF0LXNpZGVuYXYnLFxuICBleHBvcnRBczogJ21hdFNpZGVuYXYnLFxuICB0ZW1wbGF0ZVVybDogJ2RyYXdlci5odG1sJyxcbiAgYW5pbWF0aW9uczogW21hdERyYXdlckFuaW1hdGlvbnMudHJhbnNmb3JtRHJhd2VyXSxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtZHJhd2VyIG1hdC1zaWRlbmF2JyxcbiAgICAndGFiSW5kZXgnOiAnLTEnLFxuICAgIC8vIG11c3QgcHJldmVudCB0aGUgYnJvd3NlciBmcm9tIGFsaWduaW5nIHRleHQgYmFzZWQgb24gdmFsdWVcbiAgICAnW2F0dHIuYWxpZ25dJzogJ251bGwnLFxuICAgICdbY2xhc3MubWF0LWRyYXdlci1lbmRdJzogJ3Bvc2l0aW9uID09PSBcImVuZFwiJyxcbiAgICAnW2NsYXNzLm1hdC1kcmF3ZXItb3Zlcl0nOiAnbW9kZSA9PT0gXCJvdmVyXCInLFxuICAgICdbY2xhc3MubWF0LWRyYXdlci1wdXNoXSc6ICdtb2RlID09PSBcInB1c2hcIicsXG4gICAgJ1tjbGFzcy5tYXQtZHJhd2VyLXNpZGVdJzogJ21vZGUgPT09IFwic2lkZVwiJyxcbiAgICAnW2NsYXNzLm1hdC1kcmF3ZXItb3BlbmVkXSc6ICdvcGVuZWQnLFxuICAgICdbY2xhc3MubWF0LXNpZGVuYXYtZml4ZWRdJzogJ2ZpeGVkSW5WaWV3cG9ydCcsXG4gICAgJ1tzdHlsZS50b3AucHhdJzogJ2ZpeGVkSW5WaWV3cG9ydCA/IGZpeGVkVG9wR2FwIDogbnVsbCcsXG4gICAgJ1tzdHlsZS5ib3R0b20ucHhdJzogJ2ZpeGVkSW5WaWV3cG9ydCA/IGZpeGVkQm90dG9tR2FwIDogbnVsbCcsXG4gIH0sXG4gIGNoYW5nZURldGVjdGlvbjogQ2hhbmdlRGV0ZWN0aW9uU3RyYXRlZ3kuT25QdXNoLFxuICBlbmNhcHN1bGF0aW9uOiBWaWV3RW5jYXBzdWxhdGlvbi5Ob25lLFxufSlcbmV4cG9ydCBjbGFzcyBNYXRTaWRlbmF2IGV4dGVuZHMgTWF0RHJhd2VyIHtcbiAgLyoqIFdoZXRoZXIgdGhlIHNpZGVuYXYgaXMgZml4ZWQgaW4gdGhlIHZpZXdwb3J0LiAqL1xuICBASW5wdXQoKVxuICBnZXQgZml4ZWRJblZpZXdwb3J0KCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5fZml4ZWRJblZpZXdwb3J0OyB9XG4gIHNldCBmaXhlZEluVmlld3BvcnQodmFsdWUpIHsgdGhpcy5fZml4ZWRJblZpZXdwb3J0ID0gY29lcmNlQm9vbGVhblByb3BlcnR5KHZhbHVlKTsgfVxuICBwcml2YXRlIF9maXhlZEluVmlld3BvcnQgPSBmYWxzZTtcblxuICAvKipcbiAgICogVGhlIGdhcCBiZXR3ZWVuIHRoZSB0b3Agb2YgdGhlIHNpZGVuYXYgYW5kIHRoZSB0b3Agb2YgdGhlIHZpZXdwb3J0IHdoZW4gdGhlIHNpZGVuYXYgaXMgaW4gZml4ZWRcbiAgICogbW9kZS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBmaXhlZFRvcEdhcCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fZml4ZWRUb3BHYXA7IH1cbiAgc2V0IGZpeGVkVG9wR2FwKHZhbHVlKSB7IHRoaXMuX2ZpeGVkVG9wR2FwID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpOyB9XG4gIHByaXZhdGUgX2ZpeGVkVG9wR2FwID0gMDtcblxuICAvKipcbiAgICogVGhlIGdhcCBiZXR3ZWVuIHRoZSBib3R0b20gb2YgdGhlIHNpZGVuYXYgYW5kIHRoZSBib3R0b20gb2YgdGhlIHZpZXdwb3J0IHdoZW4gdGhlIHNpZGVuYXYgaXMgaW5cbiAgICogZml4ZWQgbW9kZS5cbiAgICovXG4gIEBJbnB1dCgpXG4gIGdldCBmaXhlZEJvdHRvbUdhcCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fZml4ZWRCb3R0b21HYXA7IH1cbiAgc2V0IGZpeGVkQm90dG9tR2FwKHZhbHVlKSB7IHRoaXMuX2ZpeGVkQm90dG9tR2FwID0gY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpOyB9XG4gIHByaXZhdGUgX2ZpeGVkQm90dG9tR2FwID0gMDtcbn1cblxuXG5AQ29tcG9uZW50KHtcbiAgbW9kdWxlSWQ6IG1vZHVsZS5pZCxcbiAgc2VsZWN0b3I6ICdtYXQtc2lkZW5hdi1jb250YWluZXInLFxuICBleHBvcnRBczogJ21hdFNpZGVuYXZDb250YWluZXInLFxuICB0ZW1wbGF0ZVVybDogJ3NpZGVuYXYtY29udGFpbmVyLmh0bWwnLFxuICBzdHlsZVVybHM6IFsnZHJhd2VyLmNzcyddLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1kcmF3ZXItY29udGFpbmVyIG1hdC1zaWRlbmF2LWNvbnRhaW5lcicsXG4gICAgJ1tjbGFzcy5tYXQtZHJhd2VyLWNvbnRhaW5lci1leHBsaWNpdC1iYWNrZHJvcF0nOiAnX2JhY2tkcm9wT3ZlcnJpZGUnLFxuICB9LFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0U2lkZW5hdkNvbnRhaW5lciBleHRlbmRzIE1hdERyYXdlckNvbnRhaW5lciB7XG4gIEBDb250ZW50Q2hpbGRyZW4oTWF0U2lkZW5hdikgX2RyYXdlcnM6IFF1ZXJ5TGlzdDxNYXRTaWRlbmF2PjtcbiAgQENvbnRlbnRDaGlsZChNYXRTaWRlbmF2Q29udGVudCwge3N0YXRpYzogZmFsc2V9KSBfY29udGVudDogTWF0U2lkZW5hdkNvbnRlbnQ7XG59XG4iXX0=