/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata, __param } from "tslib";
import { coerceNumberProperty, coerceBooleanProperty } from '@angular/cdk/coercion';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output, ViewEncapsulation, InjectionToken, Inject, Optional, } from '@angular/core';
import { MatPaginatorIntl } from './paginator-intl';
import { mixinInitialized, mixinDisabled, } from '@angular/material/core';
/** The default page size if there is no page size and there are no provided page size options. */
const DEFAULT_PAGE_SIZE = 50;
/**
 * Change event object that is emitted when the user selects a
 * different page size or navigates to another page.
 */
export class PageEvent {
}
/** Injection token that can be used to provide the default options for the paginator module. */
export const MAT_PAGINATOR_DEFAULT_OPTIONS = new InjectionToken('MAT_PAGINATOR_DEFAULT_OPTIONS');
// Boilerplate for applying mixins to MatPaginator.
/** @docs-private */
class MatPaginatorBase {
}
const _MatPaginatorBase = mixinDisabled(mixinInitialized(MatPaginatorBase));
/**
 * Component to provide navigation between paged information. Displays the size of the current
 * page, user-selectable options to change that size, what items are being shown, and
 * navigational button to go to the previous or next page.
 */
let MatPaginator = /** @class */ (() => {
    let MatPaginator = class MatPaginator extends _MatPaginatorBase {
        constructor(_intl, _changeDetectorRef, defaults) {
            super();
            this._intl = _intl;
            this._changeDetectorRef = _changeDetectorRef;
            this._pageIndex = 0;
            this._length = 0;
            this._pageSizeOptions = [];
            this._hidePageSize = false;
            this._showFirstLastButtons = false;
            /** Event emitted when the paginator changes the page size or page index. */
            this.page = new EventEmitter();
            this._intlChanges = _intl.changes.subscribe(() => this._changeDetectorRef.markForCheck());
            if (defaults) {
                const { pageSize, pageSizeOptions, hidePageSize, showFirstLastButtons } = defaults;
                if (pageSize != null) {
                    this._pageSize = pageSize;
                }
                if (pageSizeOptions != null) {
                    this._pageSizeOptions = pageSizeOptions;
                }
                if (hidePageSize != null) {
                    this._hidePageSize = hidePageSize;
                }
                if (showFirstLastButtons != null) {
                    this._showFirstLastButtons = showFirstLastButtons;
                }
            }
        }
        /** The zero-based page index of the displayed list of items. Defaulted to 0. */
        get pageIndex() { return this._pageIndex; }
        set pageIndex(value) {
            this._pageIndex = Math.max(coerceNumberProperty(value), 0);
            this._changeDetectorRef.markForCheck();
        }
        /** The length of the total number of items that are being paginated. Defaulted to 0. */
        get length() { return this._length; }
        set length(value) {
            this._length = coerceNumberProperty(value);
            this._changeDetectorRef.markForCheck();
        }
        /** Number of items to display on a page. By default set to 50. */
        get pageSize() { return this._pageSize; }
        set pageSize(value) {
            this._pageSize = Math.max(coerceNumberProperty(value), 0);
            this._updateDisplayedPageSizeOptions();
        }
        /** The set of provided page size options to display to the user. */
        get pageSizeOptions() { return this._pageSizeOptions; }
        set pageSizeOptions(value) {
            this._pageSizeOptions = (value || []).map(p => coerceNumberProperty(p));
            this._updateDisplayedPageSizeOptions();
        }
        /** Whether to hide the page size selection UI from the user. */
        get hidePageSize() { return this._hidePageSize; }
        set hidePageSize(value) {
            this._hidePageSize = coerceBooleanProperty(value);
        }
        /** Whether to show the first/last buttons UI to the user. */
        get showFirstLastButtons() { return this._showFirstLastButtons; }
        set showFirstLastButtons(value) {
            this._showFirstLastButtons = coerceBooleanProperty(value);
        }
        ngOnInit() {
            this._initialized = true;
            this._updateDisplayedPageSizeOptions();
            this._markInitialized();
        }
        ngOnDestroy() {
            this._intlChanges.unsubscribe();
        }
        /** Advances to the next page if it exists. */
        nextPage() {
            if (!this.hasNextPage()) {
                return;
            }
            const previousPageIndex = this.pageIndex;
            this.pageIndex++;
            this._emitPageEvent(previousPageIndex);
        }
        /** Move back to the previous page if it exists. */
        previousPage() {
            if (!this.hasPreviousPage()) {
                return;
            }
            const previousPageIndex = this.pageIndex;
            this.pageIndex--;
            this._emitPageEvent(previousPageIndex);
        }
        /** Move to the first page if not already there. */
        firstPage() {
            // hasPreviousPage being false implies at the start
            if (!this.hasPreviousPage()) {
                return;
            }
            const previousPageIndex = this.pageIndex;
            this.pageIndex = 0;
            this._emitPageEvent(previousPageIndex);
        }
        /** Move to the last page if not already there. */
        lastPage() {
            // hasNextPage being false implies at the end
            if (!this.hasNextPage()) {
                return;
            }
            const previousPageIndex = this.pageIndex;
            this.pageIndex = this.getNumberOfPages() - 1;
            this._emitPageEvent(previousPageIndex);
        }
        /** Whether there is a previous page. */
        hasPreviousPage() {
            return this.pageIndex >= 1 && this.pageSize != 0;
        }
        /** Whether there is a next page. */
        hasNextPage() {
            const maxPageIndex = this.getNumberOfPages() - 1;
            return this.pageIndex < maxPageIndex && this.pageSize != 0;
        }
        /** Calculate the number of pages */
        getNumberOfPages() {
            if (!this.pageSize) {
                return 0;
            }
            return Math.ceil(this.length / this.pageSize);
        }
        /**
         * Changes the page size so that the first item displayed on the page will still be
         * displayed using the new page size.
         *
         * For example, if the page size is 10 and on the second page (items indexed 10-19) then
         * switching so that the page size is 5 will set the third page as the current page so
         * that the 10th item will still be displayed.
         */
        _changePageSize(pageSize) {
            // Current page needs to be updated to reflect the new page size. Navigate to the page
            // containing the previous page's first item.
            const startIndex = this.pageIndex * this.pageSize;
            const previousPageIndex = this.pageIndex;
            this.pageIndex = Math.floor(startIndex / pageSize) || 0;
            this.pageSize = pageSize;
            this._emitPageEvent(previousPageIndex);
        }
        /** Checks whether the buttons for going forwards should be disabled. */
        _nextButtonsDisabled() {
            return this.disabled || !this.hasNextPage();
        }
        /** Checks whether the buttons for going backwards should be disabled. */
        _previousButtonsDisabled() {
            return this.disabled || !this.hasPreviousPage();
        }
        /**
         * Updates the list of page size options to display to the user. Includes making sure that
         * the page size is an option and that the list is sorted.
         */
        _updateDisplayedPageSizeOptions() {
            if (!this._initialized) {
                return;
            }
            // If no page size is provided, use the first page size option or the default page size.
            if (!this.pageSize) {
                this._pageSize = this.pageSizeOptions.length != 0 ?
                    this.pageSizeOptions[0] :
                    DEFAULT_PAGE_SIZE;
            }
            this._displayedPageSizeOptions = this.pageSizeOptions.slice();
            if (this._displayedPageSizeOptions.indexOf(this.pageSize) === -1) {
                this._displayedPageSizeOptions.push(this.pageSize);
            }
            // Sort the numbers using a number-specific sort function.
            this._displayedPageSizeOptions.sort((a, b) => a - b);
            this._changeDetectorRef.markForCheck();
        }
        /** Emits an event notifying that a change of the paginator's properties has been triggered. */
        _emitPageEvent(previousPageIndex) {
            this.page.emit({
                previousPageIndex,
                pageIndex: this.pageIndex,
                pageSize: this.pageSize,
                length: this.length
            });
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", Object)
    ], MatPaginator.prototype, "color", void 0);
    __decorate([
        Input(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], MatPaginator.prototype, "pageIndex", null);
    __decorate([
        Input(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], MatPaginator.prototype, "length", null);
    __decorate([
        Input(),
        __metadata("design:type", Number),
        __metadata("design:paramtypes", [Number])
    ], MatPaginator.prototype, "pageSize", null);
    __decorate([
        Input(),
        __metadata("design:type", Array),
        __metadata("design:paramtypes", [Array])
    ], MatPaginator.prototype, "pageSizeOptions", null);
    __decorate([
        Input(),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], MatPaginator.prototype, "hidePageSize", null);
    __decorate([
        Input(),
        __metadata("design:type", Boolean),
        __metadata("design:paramtypes", [Boolean])
    ], MatPaginator.prototype, "showFirstLastButtons", null);
    __decorate([
        Output(),
        __metadata("design:type", EventEmitter)
    ], MatPaginator.prototype, "page", void 0);
    MatPaginator = __decorate([
        Component({
            selector: 'mat-paginator',
            exportAs: 'matPaginator',
            template: "<div class=\"mat-paginator-outer-container\">\n  <div class=\"mat-paginator-container\">\n    <div class=\"mat-paginator-page-size\" *ngIf=\"!hidePageSize\">\n      <div class=\"mat-paginator-page-size-label\">\n        {{_intl.itemsPerPageLabel}}\n      </div>\n\n      <mat-form-field\n        *ngIf=\"_displayedPageSizeOptions.length > 1\"\n        [color]=\"color\"\n        class=\"mat-paginator-page-size-select\">\n        <mat-select\n          [value]=\"pageSize\"\n          [disabled]=\"disabled\"\n          [aria-label]=\"_intl.itemsPerPageLabel\"\n          (selectionChange)=\"_changePageSize($event.value)\">\n          <mat-option *ngFor=\"let pageSizeOption of _displayedPageSizeOptions\" [value]=\"pageSizeOption\">\n            {{pageSizeOption}}\n          </mat-option>\n        </mat-select>\n      </mat-form-field>\n\n      <div\n        class=\"mat-paginator-page-size-value\"\n        *ngIf=\"_displayedPageSizeOptions.length <= 1\">{{pageSize}}</div>\n    </div>\n\n    <div class=\"mat-paginator-range-actions\">\n      <div class=\"mat-paginator-range-label\">\n        {{_intl.getRangeLabel(pageIndex, pageSize, length)}}\n      </div>\n\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-first\"\n              (click)=\"firstPage()\"\n              [attr.aria-label]=\"_intl.firstPageLabel\"\n              [matTooltip]=\"_intl.firstPageLabel\"\n              [matTooltipDisabled]=\"_previousButtonsDisabled()\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"_previousButtonsDisabled()\"\n              *ngIf=\"showFirstLastButtons\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M18.41 16.59L13.82 12l4.59-4.59L17 6l-6 6 6 6zM6 6h2v12H6z\"/>\n        </svg>\n      </button>\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-previous\"\n              (click)=\"previousPage()\"\n              [attr.aria-label]=\"_intl.previousPageLabel\"\n              [matTooltip]=\"_intl.previousPageLabel\"\n              [matTooltipDisabled]=\"_previousButtonsDisabled()\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"_previousButtonsDisabled()\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z\"/>\n        </svg>\n      </button>\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-next\"\n              (click)=\"nextPage()\"\n              [attr.aria-label]=\"_intl.nextPageLabel\"\n              [matTooltip]=\"_intl.nextPageLabel\"\n              [matTooltipDisabled]=\"_nextButtonsDisabled()\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"_nextButtonsDisabled()\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z\"/>\n        </svg>\n      </button>\n      <button mat-icon-button type=\"button\"\n              class=\"mat-paginator-navigation-last\"\n              (click)=\"lastPage()\"\n              [attr.aria-label]=\"_intl.lastPageLabel\"\n              [matTooltip]=\"_intl.lastPageLabel\"\n              [matTooltipDisabled]=\"_nextButtonsDisabled()\"\n              [matTooltipPosition]=\"'above'\"\n              [disabled]=\"_nextButtonsDisabled()\"\n              *ngIf=\"showFirstLastButtons\">\n        <svg class=\"mat-paginator-icon\" viewBox=\"0 0 24 24\" focusable=\"false\">\n          <path d=\"M5.59 7.41L10.18 12l-4.59 4.59L7 18l6-6-6-6zM16 6h2v12h-2z\"/>\n        </svg>\n      </button>\n    </div>\n  </div>\n</div>\n",
            inputs: ['disabled'],
            host: {
                'class': 'mat-paginator',
            },
            changeDetection: ChangeDetectionStrategy.OnPush,
            encapsulation: ViewEncapsulation.None,
            styles: [".mat-paginator{display:block}.mat-paginator-outer-container{display:flex}.mat-paginator-container{display:flex;align-items:center;justify-content:flex-end;padding:0 8px;flex-wrap:wrap-reverse;width:100%}.mat-paginator-page-size{display:flex;align-items:baseline;margin-right:8px}[dir=rtl] .mat-paginator-page-size{margin-right:0;margin-left:8px}.mat-paginator-page-size-label{margin:0 4px}.mat-paginator-page-size-select{margin:6px 4px 0 4px;width:56px}.mat-paginator-page-size-select.mat-form-field-appearance-outline{width:64px}.mat-paginator-page-size-select.mat-form-field-appearance-fill{width:64px}.mat-paginator-range-label{margin:0 32px 0 24px}.mat-paginator-range-actions{display:flex;align-items:center}.mat-paginator-icon{width:28px;fill:currentColor}[dir=rtl] .mat-paginator-icon{transform:rotate(180deg)}\n"]
        }),
        __param(2, Optional()), __param(2, Inject(MAT_PAGINATOR_DEFAULT_OPTIONS)),
        __metadata("design:paramtypes", [MatPaginatorIntl,
            ChangeDetectorRef, Object])
    ], MatPaginator);
    return MatPaginator;
})();
export { MatPaginator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFnaW5hdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3BhZ2luYXRvci9wYWdpbmF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFDTCxvQkFBb0IsRUFDcEIscUJBQXFCLEVBR3RCLE1BQU0sdUJBQXVCLENBQUM7QUFDL0IsT0FBTyxFQUNMLHVCQUF1QixFQUN2QixpQkFBaUIsRUFDakIsU0FBUyxFQUNULFlBQVksRUFDWixLQUFLLEVBR0wsTUFBTSxFQUNOLGlCQUFpQixFQUNqQixjQUFjLEVBQ2QsTUFBTSxFQUNOLFFBQVEsR0FDVCxNQUFNLGVBQWUsQ0FBQztBQUV2QixPQUFPLEVBQUMsZ0JBQWdCLEVBQUMsTUFBTSxrQkFBa0IsQ0FBQztBQUNsRCxPQUFPLEVBR0wsZ0JBQWdCLEVBRWhCLGFBQWEsR0FHZCxNQUFNLHdCQUF3QixDQUFDO0FBRWhDLGtHQUFrRztBQUNsRyxNQUFNLGlCQUFpQixHQUFHLEVBQUUsQ0FBQztBQUU3Qjs7O0dBR0c7QUFDSCxNQUFNLE9BQU8sU0FBUztDQWVyQjtBQWtCRCxnR0FBZ0c7QUFDaEcsTUFBTSxDQUFDLE1BQU0sNkJBQTZCLEdBQ3RDLElBQUksY0FBYyxDQUE2QiwrQkFBK0IsQ0FBQyxDQUFDO0FBRXBGLG1EQUFtRDtBQUNuRCxvQkFBb0I7QUFDcEIsTUFBTSxnQkFBZ0I7Q0FBRztBQUN6QixNQUFNLGlCQUFpQixHQUNuQixhQUFhLENBQUMsZ0JBQWdCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQyxDQUFDO0FBRXREOzs7O0dBSUc7QUFhSDtJQUFBLElBQWEsWUFBWSxHQUF6QixNQUFhLFlBQWEsU0FBUSxpQkFBaUI7UUFtRWpELFlBQW1CLEtBQXVCLEVBQ3RCLGtCQUFxQyxFQUV6QyxRQUFxQztZQUNuRCxLQUFLLEVBQUUsQ0FBQztZQUpTLFVBQUssR0FBTCxLQUFLLENBQWtCO1lBQ3RCLHVC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RSxDQUFBLEVBQUUsV0FBQSxNQUFNLENBQUMsNkJBQTZCLENBQUMsQ0FBQTt5Q0FGcEMsZ0JBQWdCO1lBQ0YsaUJBQWlCO09BcEU5QyxZQUFZLENBME94QjtJQUFELG1CQUFDO0tBQUE7U0ExT1ksWUFBWSIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1xuICBjb2VyY2VOdW1iZXJQcm9wZXJ0eSxcbiAgY29lcmNlQm9vbGVhblByb3BlcnR5LFxuICBCb29sZWFuSW5wdXQsXG4gIE51bWJlcklucHV0XG59IGZyb20gJ0Bhbmd1bGFyL2Nkay9jb2VyY2lvbic7XG5pbXBvcnQge1xuICBDaGFuZ2VEZXRlY3Rpb25TdHJhdGVneSxcbiAgQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gIENvbXBvbmVudCxcbiAgRXZlbnRFbWl0dGVyLFxuICBJbnB1dCxcbiAgT25EZXN0cm95LFxuICBPbkluaXQsXG4gIE91dHB1dCxcbiAgVmlld0VuY2Fwc3VsYXRpb24sXG4gIEluamVjdGlvblRva2VuLFxuICBJbmplY3QsXG4gIE9wdGlvbmFsLFxufSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7U3Vic2NyaXB0aW9ufSBmcm9tICdyeGpzJztcbmltcG9ydCB7TWF0UGFnaW5hdG9ySW50bH0gZnJvbSAnLi9wYWdpbmF0b3ItaW50bCc7XG5pbXBvcnQge1xuICBIYXNJbml0aWFsaXplZCxcbiAgSGFzSW5pdGlhbGl6ZWRDdG9yLFxuICBtaXhpbkluaXRpYWxpemVkLFxuICBUaGVtZVBhbGV0dGUsXG4gIG1peGluRGlzYWJsZWQsXG4gIENhbkRpc2FibGVDdG9yLFxuICBDYW5EaXNhYmxlLFxufSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcblxuLyoqIFRoZSBkZWZhdWx0IHBhZ2Ugc2l6ZSBpZiB0aGVyZSBpcyBubyBwYWdlIHNpemUgYW5kIHRoZXJlIGFyZSBubyBwcm92aWRlZCBwYWdlIHNpemUgb3B0aW9ucy4gKi9cbmNvbnN0IERFRkFVTFRfUEFHRV9TSVpFID0gNTA7XG5cbi8qKlxuICogQ2hhbmdlIGV2ZW50IG9iamVjdCB0aGF0IGlzIGVtaXR0ZWQgd2hlbiB0aGUgdXNlciBzZWxlY3RzIGFcbiAqIGRpZmZlcmVudCBwYWdlIHNpemUgb3IgbmF2aWdhdGVzIHRvIGFub3RoZXIgcGFnZS5cbiAqL1xuZXhwb3J0IGNsYXNzIFBhZ2VFdmVudCB7XG4gIC8qKiBUaGUgY3VycmVudCBwYWdlIGluZGV4LiAqL1xuICBwYWdlSW5kZXg6IG51bWJlcjtcblxuICAvKipcbiAgICogSW5kZXggb2YgdGhlIHBhZ2UgdGhhdCB3YXMgc2VsZWN0ZWQgcHJldmlvdXNseS5cbiAgICogQGJyZWFraW5nLWNoYW5nZSA4LjAuMCBUbyBiZSBtYWRlIGludG8gYSByZXF1aXJlZCBwcm9wZXJ0eS5cbiAgICovXG4gIHByZXZpb3VzUGFnZUluZGV4PzogbnVtYmVyO1xuXG4gIC8qKiBUaGUgY3VycmVudCBwYWdlIHNpemUgKi9cbiAgcGFnZVNpemU6IG51bWJlcjtcblxuICAvKiogVGhlIGN1cnJlbnQgdG90YWwgbnVtYmVyIG9mIGl0ZW1zIGJlaW5nIHBhZ2VkICovXG4gIGxlbmd0aDogbnVtYmVyO1xufVxuXG5cbi8qKiBPYmplY3QgdGhhdCBjYW4gYmUgdXNlZCB0byBjb25maWd1cmUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHBhZ2luYXRvciBtb2R1bGUuICovXG5leHBvcnQgaW50ZXJmYWNlIE1hdFBhZ2luYXRvckRlZmF1bHRPcHRpb25zIHtcbiAgLyoqIE51bWJlciBvZiBpdGVtcyB0byBkaXNwbGF5IG9uIGEgcGFnZS4gQnkgZGVmYXVsdCBzZXQgdG8gNTAuICovXG4gIHBhZ2VTaXplPzogbnVtYmVyO1xuXG4gIC8qKiBUaGUgc2V0IG9mIHByb3ZpZGVkIHBhZ2Ugc2l6ZSBvcHRpb25zIHRvIGRpc3BsYXkgdG8gdGhlIHVzZXIuICovXG4gIHBhZ2VTaXplT3B0aW9ucz86IG51bWJlcltdO1xuXG4gIC8qKiBXaGV0aGVyIHRvIGhpZGUgdGhlIHBhZ2Ugc2l6ZSBzZWxlY3Rpb24gVUkgZnJvbSB0aGUgdXNlci4gKi9cbiAgaGlkZVBhZ2VTaXplPzogYm9vbGVhbjtcblxuICAvKiogV2hldGhlciB0byBzaG93IHRoZSBmaXJzdC9sYXN0IGJ1dHRvbnMgVUkgdG8gdGhlIHVzZXIuICovXG4gIHNob3dGaXJzdExhc3RCdXR0b25zPzogYm9vbGVhbjtcbn1cblxuLyoqIEluamVjdGlvbiB0b2tlbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHByb3ZpZGUgdGhlIGRlZmF1bHQgb3B0aW9ucyBmb3IgdGhlIHBhZ2luYXRvciBtb2R1bGUuICovXG5leHBvcnQgY29uc3QgTUFUX1BBR0lOQVRPUl9ERUZBVUxUX09QVElPTlMgPVxuICAgIG5ldyBJbmplY3Rpb25Ub2tlbjxNYXRQYWdpbmF0b3JEZWZhdWx0T3B0aW9ucz4oJ01BVF9QQUdJTkFUT1JfREVGQVVMVF9PUFRJT05TJyk7XG5cbi8vIEJvaWxlcnBsYXRlIGZvciBhcHBseWluZyBtaXhpbnMgdG8gTWF0UGFnaW5hdG9yLlxuLyoqIEBkb2NzLXByaXZhdGUgKi9cbmNsYXNzIE1hdFBhZ2luYXRvckJhc2Uge31cbmNvbnN0IF9NYXRQYWdpbmF0b3JCYXNlOiBDYW5EaXNhYmxlQ3RvciAmIEhhc0luaXRpYWxpemVkQ3RvciAmIHR5cGVvZiBNYXRQYWdpbmF0b3JCYXNlID1cbiAgICBtaXhpbkRpc2FibGVkKG1peGluSW5pdGlhbGl6ZWQoTWF0UGFnaW5hdG9yQmFzZSkpO1xuXG4vKipcbiAqIENvbXBvbmVudCB0byBwcm92aWRlIG5hdmlnYXRpb24gYmV0d2VlbiBwYWdlZCBpbmZvcm1hdGlvbi4gRGlzcGxheXMgdGhlIHNpemUgb2YgdGhlIGN1cnJlbnRcbiAqIHBhZ2UsIHVzZXItc2VsZWN0YWJsZSBvcHRpb25zIHRvIGNoYW5nZSB0aGF0IHNpemUsIHdoYXQgaXRlbXMgYXJlIGJlaW5nIHNob3duLCBhbmRcbiAqIG5hdmlnYXRpb25hbCBidXR0b24gdG8gZ28gdG8gdGhlIHByZXZpb3VzIG9yIG5leHQgcGFnZS5cbiAqL1xuQENvbXBvbmVudCh7XG4gIHNlbGVjdG9yOiAnbWF0LXBhZ2luYXRvcicsXG4gIGV4cG9ydEFzOiAnbWF0UGFnaW5hdG9yJyxcbiAgdGVtcGxhdGVVcmw6ICdwYWdpbmF0b3IuaHRtbCcsXG4gIHN0eWxlVXJsczogWydwYWdpbmF0b3IuY3NzJ10sXG4gIGlucHV0czogWydkaXNhYmxlZCddLFxuICBob3N0OiB7XG4gICAgJ2NsYXNzJzogJ21hdC1wYWdpbmF0b3InLFxuICB9LFxuICBjaGFuZ2VEZXRlY3Rpb246IENoYW5nZURldGVjdGlvblN0cmF0ZWd5Lk9uUHVzaCxcbiAgZW5jYXBzdWxhdGlvbjogVmlld0VuY2Fwc3VsYXRpb24uTm9uZSxcbn0pXG5leHBvcnQgY2xhc3MgTWF0UGFnaW5hdG9yIGV4dGVuZHMgX01hdFBhZ2luYXRvckJhc2UgaW1wbGVtZW50cyBPbkluaXQsIE9uRGVzdHJveSwgQ2FuRGlzYWJsZSxcbiAgSGFzSW5pdGlhbGl6ZWQge1xuICBwcml2YXRlIF9pbml0aWFsaXplZDogYm9vbGVhbjtcbiAgcHJpdmF0ZSBfaW50bENoYW5nZXM6IFN1YnNjcmlwdGlvbjtcblxuICAvKiogVGhlbWUgY29sb3IgdG8gYmUgdXNlZCBmb3IgdGhlIHVuZGVybHlpbmcgZm9ybSBjb250cm9scy4gKi9cbiAgQElucHV0KCkgY29sb3I6IFRoZW1lUGFsZXR0ZTtcblxuICAvKiogVGhlIHplcm8tYmFzZWQgcGFnZSBpbmRleCBvZiB0aGUgZGlzcGxheWVkIGxpc3Qgb2YgaXRlbXMuIERlZmF1bHRlZCB0byAwLiAqL1xuICBASW5wdXQoKVxuICBnZXQgcGFnZUluZGV4KCk6IG51bWJlciB7IHJldHVybiB0aGlzLl9wYWdlSW5kZXg7IH1cbiAgc2V0IHBhZ2VJbmRleCh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fcGFnZUluZGV4ID0gTWF0aC5tYXgoY29lcmNlTnVtYmVyUHJvcGVydHkodmFsdWUpLCAwKTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuICBwcml2YXRlIF9wYWdlSW5kZXggPSAwO1xuXG4gIC8qKiBUaGUgbGVuZ3RoIG9mIHRoZSB0b3RhbCBudW1iZXIgb2YgaXRlbXMgdGhhdCBhcmUgYmVpbmcgcGFnaW5hdGVkLiBEZWZhdWx0ZWQgdG8gMC4gKi9cbiAgQElucHV0KClcbiAgZ2V0IGxlbmd0aCgpOiBudW1iZXIgeyByZXR1cm4gdGhpcy5fbGVuZ3RoOyB9XG4gIHNldCBsZW5ndGgodmFsdWU6IG51bWJlcikge1xuICAgIHRoaXMuX2xlbmd0aCA9IGNvZXJjZU51bWJlclByb3BlcnR5KHZhbHVlKTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuICBwcml2YXRlIF9sZW5ndGggPSAwO1xuXG4gIC8qKiBOdW1iZXIgb2YgaXRlbXMgdG8gZGlzcGxheSBvbiBhIHBhZ2UuIEJ5IGRlZmF1bHQgc2V0IHRvIDUwLiAqL1xuICBASW5wdXQoKVxuICBnZXQgcGFnZVNpemUoKTogbnVtYmVyIHsgcmV0dXJuIHRoaXMuX3BhZ2VTaXplOyB9XG4gIHNldCBwYWdlU2l6ZSh2YWx1ZTogbnVtYmVyKSB7XG4gICAgdGhpcy5fcGFnZVNpemUgPSBNYXRoLm1heChjb2VyY2VOdW1iZXJQcm9wZXJ0eSh2YWx1ZSksIDApO1xuICAgIHRoaXMuX3VwZGF0ZURpc3BsYXllZFBhZ2VTaXplT3B0aW9ucygpO1xuICB9XG4gIHByaXZhdGUgX3BhZ2VTaXplOiBudW1iZXI7XG5cbiAgLyoqIFRoZSBzZXQgb2YgcHJvdmlkZWQgcGFnZSBzaXplIG9wdGlvbnMgdG8gZGlzcGxheSB0byB0aGUgdXNlci4gKi9cbiAgQElucHV0KClcbiAgZ2V0IHBhZ2VTaXplT3B0aW9ucygpOiBudW1iZXJbXSB7IHJldHVybiB0aGlzLl9wYWdlU2l6ZU9wdGlvbnM7IH1cbiAgc2V0IHBhZ2VTaXplT3B0aW9ucyh2YWx1ZTogbnVtYmVyW10pIHtcbiAgICB0aGlzLl9wYWdlU2l6ZU9wdGlvbnMgPSAodmFsdWUgfHwgW10pLm1hcChwID0+IGNvZXJjZU51bWJlclByb3BlcnR5KHApKTtcbiAgICB0aGlzLl91cGRhdGVEaXNwbGF5ZWRQYWdlU2l6ZU9wdGlvbnMoKTtcbiAgfVxuICBwcml2YXRlIF9wYWdlU2l6ZU9wdGlvbnM6IG51bWJlcltdID0gW107XG5cbiAgLyoqIFdoZXRoZXIgdG8gaGlkZSB0aGUgcGFnZSBzaXplIHNlbGVjdGlvbiBVSSBmcm9tIHRoZSB1c2VyLiAqL1xuICBASW5wdXQoKVxuICBnZXQgaGlkZVBhZ2VTaXplKCk6IGJvb2xlYW4geyByZXR1cm4gdGhpcy5faGlkZVBhZ2VTaXplOyB9XG4gIHNldCBoaWRlUGFnZVNpemUodmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9oaWRlUGFnZVNpemUgPSBjb2VyY2VCb29sZWFuUHJvcGVydHkodmFsdWUpO1xuICB9XG4gIHByaXZhdGUgX2hpZGVQYWdlU2l6ZSA9IGZhbHNlO1xuXG5cbiAgLyoqIFdoZXRoZXIgdG8gc2hvdyB0aGUgZmlyc3QvbGFzdCBidXR0b25zIFVJIHRvIHRoZSB1c2VyLiAqL1xuICBASW5wdXQoKVxuICBnZXQgc2hvd0ZpcnN0TGFzdEJ1dHRvbnMoKTogYm9vbGVhbiB7IHJldHVybiB0aGlzLl9zaG93Rmlyc3RMYXN0QnV0dG9uczsgfVxuICBzZXQgc2hvd0ZpcnN0TGFzdEJ1dHRvbnModmFsdWU6IGJvb2xlYW4pIHtcbiAgICB0aGlzLl9zaG93Rmlyc3RMYXN0QnV0dG9ucyA9IGNvZXJjZUJvb2xlYW5Qcm9wZXJ0eSh2YWx1ZSk7XG4gIH1cbiAgcHJpdmF0ZSBfc2hvd0ZpcnN0TGFzdEJ1dHRvbnMgPSBmYWxzZTtcblxuICAvKiogRXZlbnQgZW1pdHRlZCB3aGVuIHRoZSBwYWdpbmF0b3IgY2hhbmdlcyB0aGUgcGFnZSBzaXplIG9yIHBhZ2UgaW5kZXguICovXG4gIEBPdXRwdXQoKSByZWFkb25seSBwYWdlOiBFdmVudEVtaXR0ZXI8UGFnZUV2ZW50PiA9IG5ldyBFdmVudEVtaXR0ZXI8UGFnZUV2ZW50PigpO1xuXG4gIC8qKiBEaXNwbGF5ZWQgc2V0IG9mIHBhZ2Ugc2l6ZSBvcHRpb25zLiBXaWxsIGJlIHNvcnRlZCBhbmQgaW5jbHVkZSBjdXJyZW50IHBhZ2Ugc2l6ZS4gKi9cbiAgX2Rpc3BsYXllZFBhZ2VTaXplT3B0aW9uczogbnVtYmVyW107XG5cbiAgY29uc3RydWN0b3IocHVibGljIF9pbnRsOiBNYXRQYWdpbmF0b3JJbnRsLFxuICAgICAgICAgICAgICBwcml2YXRlIF9jaGFuZ2VEZXRlY3RvclJlZjogQ2hhbmdlRGV0ZWN0b3JSZWYsXG4gICAgICAgICAgICAgIEBPcHRpb25hbCgpIEBJbmplY3QoTUFUX1BBR0lOQVRPUl9ERUZBVUxUX09QVElPTlMpXG4gICAgICAgICAgICAgICAgICBkZWZhdWx0cz86IE1hdFBhZ2luYXRvckRlZmF1bHRPcHRpb25zKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9pbnRsQ2hhbmdlcyA9IF9pbnRsLmNoYW5nZXMuc3Vic2NyaWJlKCgpID0+IHRoaXMuX2NoYW5nZURldGVjdG9yUmVmLm1hcmtGb3JDaGVjaygpKTtcblxuICAgIGlmIChkZWZhdWx0cykge1xuICAgICAgY29uc3Qge3BhZ2VTaXplLCBwYWdlU2l6ZU9wdGlvbnMsIGhpZGVQYWdlU2l6ZSwgc2hvd0ZpcnN0TGFzdEJ1dHRvbnN9ID0gZGVmYXVsdHM7XG5cbiAgICAgIGlmIChwYWdlU2l6ZSAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3BhZ2VTaXplID0gcGFnZVNpemU7XG4gICAgICB9XG5cbiAgICAgIGlmIChwYWdlU2l6ZU9wdGlvbnMgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9wYWdlU2l6ZU9wdGlvbnMgPSBwYWdlU2l6ZU9wdGlvbnM7XG4gICAgICB9XG5cbiAgICAgIGlmIChoaWRlUGFnZVNpemUgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLl9oaWRlUGFnZVNpemUgPSBoaWRlUGFnZVNpemU7XG4gICAgICB9XG5cbiAgICAgIGlmIChzaG93Rmlyc3RMYXN0QnV0dG9ucyAhPSBudWxsKSB7XG4gICAgICAgIHRoaXMuX3Nob3dGaXJzdExhc3RCdXR0b25zID0gc2hvd0ZpcnN0TGFzdEJ1dHRvbnM7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgbmdPbkluaXQoKSB7XG4gICAgdGhpcy5faW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIHRoaXMuX3VwZGF0ZURpc3BsYXllZFBhZ2VTaXplT3B0aW9ucygpO1xuICAgIHRoaXMuX21hcmtJbml0aWFsaXplZCgpO1xuICB9XG5cbiAgbmdPbkRlc3Ryb3koKSB7XG4gICAgdGhpcy5faW50bENoYW5nZXMudW5zdWJzY3JpYmUoKTtcbiAgfVxuXG4gIC8qKiBBZHZhbmNlcyB0byB0aGUgbmV4dCBwYWdlIGlmIGl0IGV4aXN0cy4gKi9cbiAgbmV4dFBhZ2UoKTogdm9pZCB7XG4gICAgaWYgKCF0aGlzLmhhc05leHRQYWdlKCkpIHsgcmV0dXJuOyB9XG5cbiAgICBjb25zdCBwcmV2aW91c1BhZ2VJbmRleCA9IHRoaXMucGFnZUluZGV4O1xuICAgIHRoaXMucGFnZUluZGV4Kys7XG4gICAgdGhpcy5fZW1pdFBhZ2VFdmVudChwcmV2aW91c1BhZ2VJbmRleCk7XG4gIH1cblxuICAvKiogTW92ZSBiYWNrIHRvIHRoZSBwcmV2aW91cyBwYWdlIGlmIGl0IGV4aXN0cy4gKi9cbiAgcHJldmlvdXNQYWdlKCk6IHZvaWQge1xuICAgIGlmICghdGhpcy5oYXNQcmV2aW91c1BhZ2UoKSkgeyByZXR1cm47IH1cblxuICAgIGNvbnN0IHByZXZpb3VzUGFnZUluZGV4ID0gdGhpcy5wYWdlSW5kZXg7XG4gICAgdGhpcy5wYWdlSW5kZXgtLTtcbiAgICB0aGlzLl9lbWl0UGFnZUV2ZW50KHByZXZpb3VzUGFnZUluZGV4KTtcbiAgfVxuXG4gIC8qKiBNb3ZlIHRvIHRoZSBmaXJzdCBwYWdlIGlmIG5vdCBhbHJlYWR5IHRoZXJlLiAqL1xuICBmaXJzdFBhZ2UoKTogdm9pZCB7XG4gICAgLy8gaGFzUHJldmlvdXNQYWdlIGJlaW5nIGZhbHNlIGltcGxpZXMgYXQgdGhlIHN0YXJ0XG4gICAgaWYgKCF0aGlzLmhhc1ByZXZpb3VzUGFnZSgpKSB7IHJldHVybjsgfVxuXG4gICAgY29uc3QgcHJldmlvdXNQYWdlSW5kZXggPSB0aGlzLnBhZ2VJbmRleDtcbiAgICB0aGlzLnBhZ2VJbmRleCA9IDA7XG4gICAgdGhpcy5fZW1pdFBhZ2VFdmVudChwcmV2aW91c1BhZ2VJbmRleCk7XG4gIH1cblxuICAvKiogTW92ZSB0byB0aGUgbGFzdCBwYWdlIGlmIG5vdCBhbHJlYWR5IHRoZXJlLiAqL1xuICBsYXN0UGFnZSgpOiB2b2lkIHtcbiAgICAvLyBoYXNOZXh0UGFnZSBiZWluZyBmYWxzZSBpbXBsaWVzIGF0IHRoZSBlbmRcbiAgICBpZiAoIXRoaXMuaGFzTmV4dFBhZ2UoKSkgeyByZXR1cm47IH1cblxuICAgIGNvbnN0IHByZXZpb3VzUGFnZUluZGV4ID0gdGhpcy5wYWdlSW5kZXg7XG4gICAgdGhpcy5wYWdlSW5kZXggPSB0aGlzLmdldE51bWJlck9mUGFnZXMoKSAtIDE7XG4gICAgdGhpcy5fZW1pdFBhZ2VFdmVudChwcmV2aW91c1BhZ2VJbmRleCk7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGVyZSBpcyBhIHByZXZpb3VzIHBhZ2UuICovXG4gIGhhc1ByZXZpb3VzUGFnZSgpOiBib29sZWFuIHtcbiAgICByZXR1cm4gdGhpcy5wYWdlSW5kZXggPj0gMSAmJiB0aGlzLnBhZ2VTaXplICE9IDA7XG4gIH1cblxuICAvKiogV2hldGhlciB0aGVyZSBpcyBhIG5leHQgcGFnZS4gKi9cbiAgaGFzTmV4dFBhZ2UoKTogYm9vbGVhbiB7XG4gICAgY29uc3QgbWF4UGFnZUluZGV4ID0gdGhpcy5nZXROdW1iZXJPZlBhZ2VzKCkgLSAxO1xuICAgIHJldHVybiB0aGlzLnBhZ2VJbmRleCA8IG1heFBhZ2VJbmRleCAmJiB0aGlzLnBhZ2VTaXplICE9IDA7XG4gIH1cblxuICAvKiogQ2FsY3VsYXRlIHRoZSBudW1iZXIgb2YgcGFnZXMgKi9cbiAgZ2V0TnVtYmVyT2ZQYWdlcygpOiBudW1iZXIge1xuICAgIGlmICghdGhpcy5wYWdlU2l6ZSkge1xuICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgcmV0dXJuIE1hdGguY2VpbCh0aGlzLmxlbmd0aCAvIHRoaXMucGFnZVNpemUpO1xuICB9XG5cblxuICAvKipcbiAgICogQ2hhbmdlcyB0aGUgcGFnZSBzaXplIHNvIHRoYXQgdGhlIGZpcnN0IGl0ZW0gZGlzcGxheWVkIG9uIHRoZSBwYWdlIHdpbGwgc3RpbGwgYmVcbiAgICogZGlzcGxheWVkIHVzaW5nIHRoZSBuZXcgcGFnZSBzaXplLlxuICAgKlxuICAgKiBGb3IgZXhhbXBsZSwgaWYgdGhlIHBhZ2Ugc2l6ZSBpcyAxMCBhbmQgb24gdGhlIHNlY29uZCBwYWdlIChpdGVtcyBpbmRleGVkIDEwLTE5KSB0aGVuXG4gICAqIHN3aXRjaGluZyBzbyB0aGF0IHRoZSBwYWdlIHNpemUgaXMgNSB3aWxsIHNldCB0aGUgdGhpcmQgcGFnZSBhcyB0aGUgY3VycmVudCBwYWdlIHNvXG4gICAqIHRoYXQgdGhlIDEwdGggaXRlbSB3aWxsIHN0aWxsIGJlIGRpc3BsYXllZC5cbiAgICovXG4gIF9jaGFuZ2VQYWdlU2l6ZShwYWdlU2l6ZTogbnVtYmVyKSB7XG4gICAgLy8gQ3VycmVudCBwYWdlIG5lZWRzIHRvIGJlIHVwZGF0ZWQgdG8gcmVmbGVjdCB0aGUgbmV3IHBhZ2Ugc2l6ZS4gTmF2aWdhdGUgdG8gdGhlIHBhZ2VcbiAgICAvLyBjb250YWluaW5nIHRoZSBwcmV2aW91cyBwYWdlJ3MgZmlyc3QgaXRlbS5cbiAgICBjb25zdCBzdGFydEluZGV4ID0gdGhpcy5wYWdlSW5kZXggKiB0aGlzLnBhZ2VTaXplO1xuICAgIGNvbnN0IHByZXZpb3VzUGFnZUluZGV4ID0gdGhpcy5wYWdlSW5kZXg7XG5cbiAgICB0aGlzLnBhZ2VJbmRleCA9IE1hdGguZmxvb3Ioc3RhcnRJbmRleCAvIHBhZ2VTaXplKSB8fCAwO1xuICAgIHRoaXMucGFnZVNpemUgPSBwYWdlU2l6ZTtcbiAgICB0aGlzLl9lbWl0UGFnZUV2ZW50KHByZXZpb3VzUGFnZUluZGV4KTtcbiAgfVxuXG4gIC8qKiBDaGVja3Mgd2hldGhlciB0aGUgYnV0dG9ucyBmb3IgZ29pbmcgZm9yd2FyZHMgc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xuICBfbmV4dEJ1dHRvbnNEaXNhYmxlZCgpIHtcbiAgICByZXR1cm4gdGhpcy5kaXNhYmxlZCB8fCAhdGhpcy5oYXNOZXh0UGFnZSgpO1xuICB9XG5cbiAgLyoqIENoZWNrcyB3aGV0aGVyIHRoZSBidXR0b25zIGZvciBnb2luZyBiYWNrd2FyZHMgc2hvdWxkIGJlIGRpc2FibGVkLiAqL1xuICBfcHJldmlvdXNCdXR0b25zRGlzYWJsZWQoKSB7XG4gICAgcmV0dXJuIHRoaXMuZGlzYWJsZWQgfHwgIXRoaXMuaGFzUHJldmlvdXNQYWdlKCk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgbGlzdCBvZiBwYWdlIHNpemUgb3B0aW9ucyB0byBkaXNwbGF5IHRvIHRoZSB1c2VyLiBJbmNsdWRlcyBtYWtpbmcgc3VyZSB0aGF0XG4gICAqIHRoZSBwYWdlIHNpemUgaXMgYW4gb3B0aW9uIGFuZCB0aGF0IHRoZSBsaXN0IGlzIHNvcnRlZC5cbiAgICovXG4gIHByaXZhdGUgX3VwZGF0ZURpc3BsYXllZFBhZ2VTaXplT3B0aW9ucygpIHtcbiAgICBpZiAoIXRoaXMuX2luaXRpYWxpemVkKSB7IHJldHVybjsgfVxuXG4gICAgLy8gSWYgbm8gcGFnZSBzaXplIGlzIHByb3ZpZGVkLCB1c2UgdGhlIGZpcnN0IHBhZ2Ugc2l6ZSBvcHRpb24gb3IgdGhlIGRlZmF1bHQgcGFnZSBzaXplLlxuICAgIGlmICghdGhpcy5wYWdlU2l6ZSkge1xuICAgICAgdGhpcy5fcGFnZVNpemUgPSB0aGlzLnBhZ2VTaXplT3B0aW9ucy5sZW5ndGggIT0gMCA/XG4gICAgICAgICAgdGhpcy5wYWdlU2l6ZU9wdGlvbnNbMF0gOlxuICAgICAgICAgIERFRkFVTFRfUEFHRV9TSVpFO1xuICAgIH1cblxuICAgIHRoaXMuX2Rpc3BsYXllZFBhZ2VTaXplT3B0aW9ucyA9IHRoaXMucGFnZVNpemVPcHRpb25zLnNsaWNlKCk7XG5cbiAgICBpZiAodGhpcy5fZGlzcGxheWVkUGFnZVNpemVPcHRpb25zLmluZGV4T2YodGhpcy5wYWdlU2l6ZSkgPT09IC0xKSB7XG4gICAgICB0aGlzLl9kaXNwbGF5ZWRQYWdlU2l6ZU9wdGlvbnMucHVzaCh0aGlzLnBhZ2VTaXplKTtcbiAgICB9XG5cbiAgICAvLyBTb3J0IHRoZSBudW1iZXJzIHVzaW5nIGEgbnVtYmVyLXNwZWNpZmljIHNvcnQgZnVuY3Rpb24uXG4gICAgdGhpcy5fZGlzcGxheWVkUGFnZVNpemVPcHRpb25zLnNvcnQoKGEsIGIpID0+IGEgLSBiKTtcbiAgICB0aGlzLl9jaGFuZ2VEZXRlY3RvclJlZi5tYXJrRm9yQ2hlY2soKTtcbiAgfVxuXG4gIC8qKiBFbWl0cyBhbiBldmVudCBub3RpZnlpbmcgdGhhdCBhIGNoYW5nZSBvZiB0aGUgcGFnaW5hdG9yJ3MgcHJvcGVydGllcyBoYXMgYmVlbiB0cmlnZ2VyZWQuICovXG4gIHByaXZhdGUgX2VtaXRQYWdlRXZlbnQocHJldmlvdXNQYWdlSW5kZXg6IG51bWJlcikge1xuICAgIHRoaXMucGFnZS5lbWl0KHtcbiAgICAgIHByZXZpb3VzUGFnZUluZGV4LFxuICAgICAgcGFnZUluZGV4OiB0aGlzLnBhZ2VJbmRleCxcbiAgICAgIHBhZ2VTaXplOiB0aGlzLnBhZ2VTaXplLFxuICAgICAgbGVuZ3RoOiB0aGlzLmxlbmd0aFxuICAgIH0pO1xuICB9XG5cbiAgc3RhdGljIG5nQWNjZXB0SW5wdXRUeXBlX3BhZ2VJbmRleDogTnVtYmVySW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9sZW5ndGg6IE51bWJlcklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfcGFnZVNpemU6IE51bWJlcklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfaGlkZVBhZ2VTaXplOiBCb29sZWFuSW5wdXQ7XG4gIHN0YXRpYyBuZ0FjY2VwdElucHV0VHlwZV9zaG93Rmlyc3RMYXN0QnV0dG9uczogQm9vbGVhbklucHV0O1xuICBzdGF0aWMgbmdBY2NlcHRJbnB1dFR5cGVfZGlzYWJsZWQ6IEJvb2xlYW5JbnB1dDtcbn1cbiJdfQ==