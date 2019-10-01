/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
/**
 * Configuration for opening a modal dialog with the MatDialog service.
 */
var MatDialogConfig = /** @class */ (function () {
    function MatDialogConfig() {
        /** The ARIA role of the dialog element. */
        this.role = 'dialog';
        /** Custom class for the overlay pane. */
        this.panelClass = '';
        /** Whether the dialog has a backdrop. */
        this.hasBackdrop = true;
        /** Custom class for the backdrop, */
        this.backdropClass = '';
        /** Whether the user can use escape or clicking on the backdrop to close the modal. */
        this.disableClose = false;
        /** Width of the dialog. */
        this.width = '';
        /** Height of the dialog. */
        this.height = '';
        /** Max-width of the dialog. If a number is provided, pixel units are assumed. Defaults to 80vw */
        this.maxWidth = '80vw';
        /** Data being injected into the child component. */
        this.data = null;
        /** ID of the element that describes the dialog. */
        this.ariaDescribedBy = null;
        /** ID of the element that labels the dialog. */
        this.ariaLabelledBy = null;
        /** Aria label to assign to the dialog element */
        this.ariaLabel = null;
        /** Whether the dialog should focus the first focusable element on open. */
        this.autoFocus = true;
        /**
         * Whether the dialog should restore focus to the
         * previously-focused element, after it's closed.
         */
        this.restoreFocus = true;
        /**
         * Whether the dialog should close when the user goes backwards/forwards in history.
         * Note that this usually doesn't include clicking on links (unless the user is using
         * the `HashLocationStrategy`).
         */
        this.closeOnNavigation = true;
        // TODO(jelbourn): add configuration for lifecycle hooks, ARIA labelling.
    }
    return MatDialogConfig;
}());
export { MatDialogConfig };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLWNvbmZpZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kaWFsb2cvZGlhbG9nLWNvbmZpZy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUF3Qkg7O0dBRUc7QUFDSDtJQUFBO1FBYUUsMkNBQTJDO1FBQzNDLFNBQUksR0FBZ0IsUUFBUSxDQUFDO1FBRTdCLHlDQUF5QztRQUN6QyxlQUFVLEdBQXVCLEVBQUUsQ0FBQztRQUVwQyx5Q0FBeUM7UUFDekMsZ0JBQVcsR0FBYSxJQUFJLENBQUM7UUFFN0IscUNBQXFDO1FBQ3JDLGtCQUFhLEdBQVksRUFBRSxDQUFDO1FBRTVCLHNGQUFzRjtRQUN0RixpQkFBWSxHQUFhLEtBQUssQ0FBQztRQUUvQiwyQkFBMkI7UUFDM0IsVUFBSyxHQUFZLEVBQUUsQ0FBQztRQUVwQiw0QkFBNEI7UUFDNUIsV0FBTSxHQUFZLEVBQUUsQ0FBQztRQVFyQixrR0FBa0c7UUFDbEcsYUFBUSxHQUFxQixNQUFNLENBQUM7UUFRcEMsb0RBQW9EO1FBQ3BELFNBQUksR0FBYyxJQUFJLENBQUM7UUFLdkIsbURBQW1EO1FBQ25ELG9CQUFlLEdBQW1CLElBQUksQ0FBQztRQUV2QyxnREFBZ0Q7UUFDaEQsbUJBQWMsR0FBbUIsSUFBSSxDQUFDO1FBRXRDLGlEQUFpRDtRQUNqRCxjQUFTLEdBQW1CLElBQUksQ0FBQztRQUVqQywyRUFBMkU7UUFDM0UsY0FBUyxHQUFhLElBQUksQ0FBQztRQUUzQjs7O1dBR0c7UUFDSCxpQkFBWSxHQUFhLElBQUksQ0FBQztRQUs5Qjs7OztXQUlHO1FBQ0gsc0JBQWlCLEdBQWEsSUFBSSxDQUFDO1FBS25DLHlFQUF5RTtJQUMzRSxDQUFDO0lBQUQsc0JBQUM7QUFBRCxDQUFDLEFBdkZELElBdUZDIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7Vmlld0NvbnRhaW5lclJlZiwgQ29tcG9uZW50RmFjdG9yeVJlc29sdmVyfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGlyZWN0aW9ufSBmcm9tICdAYW5ndWxhci9jZGsvYmlkaSc7XG5pbXBvcnQge1Njcm9sbFN0cmF0ZWd5fSBmcm9tICdAYW5ndWxhci9jZGsvb3ZlcmxheSc7XG5cbi8qKiBWYWxpZCBBUklBIHJvbGVzIGZvciBhIGRpYWxvZyBlbGVtZW50LiAqL1xuZXhwb3J0IHR5cGUgRGlhbG9nUm9sZSA9ICdkaWFsb2cnIHwgJ2FsZXJ0ZGlhbG9nJztcblxuLyoqIFBvc3NpYmxlIG92ZXJyaWRlcyBmb3IgYSBkaWFsb2cncyBwb3NpdGlvbi4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRGlhbG9nUG9zaXRpb24ge1xuICAvKiogT3ZlcnJpZGUgZm9yIHRoZSBkaWFsb2cncyB0b3AgcG9zaXRpb24uICovXG4gIHRvcD86IHN0cmluZztcblxuICAvKiogT3ZlcnJpZGUgZm9yIHRoZSBkaWFsb2cncyBib3R0b20gcG9zaXRpb24uICovXG4gIGJvdHRvbT86IHN0cmluZztcblxuICAvKiogT3ZlcnJpZGUgZm9yIHRoZSBkaWFsb2cncyBsZWZ0IHBvc2l0aW9uLiAqL1xuICBsZWZ0Pzogc3RyaW5nO1xuXG4gIC8qKiBPdmVycmlkZSBmb3IgdGhlIGRpYWxvZydzIHJpZ2h0IHBvc2l0aW9uLiAqL1xuICByaWdodD86IHN0cmluZztcbn1cblxuLyoqXG4gKiBDb25maWd1cmF0aW9uIGZvciBvcGVuaW5nIGEgbW9kYWwgZGlhbG9nIHdpdGggdGhlIE1hdERpYWxvZyBzZXJ2aWNlLlxuICovXG5leHBvcnQgY2xhc3MgTWF0RGlhbG9nQ29uZmlnPEQgPSBhbnk+IHtcblxuICAvKipcbiAgICogV2hlcmUgdGhlIGF0dGFjaGVkIGNvbXBvbmVudCBzaG91bGQgbGl2ZSBpbiBBbmd1bGFyJ3MgKmxvZ2ljYWwqIGNvbXBvbmVudCB0cmVlLlxuICAgKiBUaGlzIGFmZmVjdHMgd2hhdCBpcyBhdmFpbGFibGUgZm9yIGluamVjdGlvbiBhbmQgdGhlIGNoYW5nZSBkZXRlY3Rpb24gb3JkZXIgZm9yIHRoZVxuICAgKiBjb21wb25lbnQgaW5zdGFudGlhdGVkIGluc2lkZSBvZiB0aGUgZGlhbG9nLiBUaGlzIGRvZXMgbm90IGFmZmVjdCB3aGVyZSB0aGUgZGlhbG9nXG4gICAqIGNvbnRlbnQgd2lsbCBiZSByZW5kZXJlZC5cbiAgICovXG4gIHZpZXdDb250YWluZXJSZWY/OiBWaWV3Q29udGFpbmVyUmVmO1xuXG4gIC8qKiBJRCBmb3IgdGhlIGRpYWxvZy4gSWYgb21pdHRlZCwgYSB1bmlxdWUgb25lIHdpbGwgYmUgZ2VuZXJhdGVkLiAqL1xuICBpZD86IHN0cmluZztcblxuICAvKiogVGhlIEFSSUEgcm9sZSBvZiB0aGUgZGlhbG9nIGVsZW1lbnQuICovXG4gIHJvbGU/OiBEaWFsb2dSb2xlID0gJ2RpYWxvZyc7XG5cbiAgLyoqIEN1c3RvbSBjbGFzcyBmb3IgdGhlIG92ZXJsYXkgcGFuZS4gKi9cbiAgcGFuZWxDbGFzcz86IHN0cmluZyB8IHN0cmluZ1tdID0gJyc7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGRpYWxvZyBoYXMgYSBiYWNrZHJvcC4gKi9cbiAgaGFzQmFja2Ryb3A/OiBib29sZWFuID0gdHJ1ZTtcblxuICAvKiogQ3VzdG9tIGNsYXNzIGZvciB0aGUgYmFja2Ryb3AsICovXG4gIGJhY2tkcm9wQ2xhc3M/OiBzdHJpbmcgPSAnJztcblxuICAvKiogV2hldGhlciB0aGUgdXNlciBjYW4gdXNlIGVzY2FwZSBvciBjbGlja2luZyBvbiB0aGUgYmFja2Ryb3AgdG8gY2xvc2UgdGhlIG1vZGFsLiAqL1xuICBkaXNhYmxlQ2xvc2U/OiBib29sZWFuID0gZmFsc2U7XG5cbiAgLyoqIFdpZHRoIG9mIHRoZSBkaWFsb2cuICovXG4gIHdpZHRoPzogc3RyaW5nID0gJyc7XG5cbiAgLyoqIEhlaWdodCBvZiB0aGUgZGlhbG9nLiAqL1xuICBoZWlnaHQ/OiBzdHJpbmcgPSAnJztcblxuICAvKiogTWluLXdpZHRoIG9mIHRoZSBkaWFsb2cuIElmIGEgbnVtYmVyIGlzIHByb3ZpZGVkLCBwaXhlbCB1bml0cyBhcmUgYXNzdW1lZC4gKi9cbiAgbWluV2lkdGg/OiBudW1iZXIgfCBzdHJpbmc7XG5cbiAgLyoqIE1pbi1oZWlnaHQgb2YgdGhlIGRpYWxvZy4gSWYgYSBudW1iZXIgaXMgcHJvdmlkZWQsIHBpeGVsIHVuaXRzIGFyZSBhc3N1bWVkLiAqL1xuICBtaW5IZWlnaHQ/OiBudW1iZXIgfCBzdHJpbmc7XG5cbiAgLyoqIE1heC13aWR0aCBvZiB0aGUgZGlhbG9nLiBJZiBhIG51bWJlciBpcyBwcm92aWRlZCwgcGl4ZWwgdW5pdHMgYXJlIGFzc3VtZWQuIERlZmF1bHRzIHRvIDgwdncgKi9cbiAgbWF4V2lkdGg/OiBudW1iZXIgfCBzdHJpbmcgPSAnODB2dyc7XG5cbiAgLyoqIE1heC1oZWlnaHQgb2YgdGhlIGRpYWxvZy4gSWYgYSBudW1iZXIgaXMgcHJvdmlkZWQsIHBpeGVsIHVuaXRzIGFyZSBhc3N1bWVkLiAqL1xuICBtYXhIZWlnaHQ/OiBudW1iZXIgfCBzdHJpbmc7XG5cbiAgLyoqIFBvc2l0aW9uIG92ZXJyaWRlcy4gKi9cbiAgcG9zaXRpb24/OiBEaWFsb2dQb3NpdGlvbjtcblxuICAvKiogRGF0YSBiZWluZyBpbmplY3RlZCBpbnRvIHRoZSBjaGlsZCBjb21wb25lbnQuICovXG4gIGRhdGE/OiBEIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIExheW91dCBkaXJlY3Rpb24gZm9yIHRoZSBkaWFsb2cncyBjb250ZW50LiAqL1xuICBkaXJlY3Rpb24/OiBEaXJlY3Rpb247XG5cbiAgLyoqIElEIG9mIHRoZSBlbGVtZW50IHRoYXQgZGVzY3JpYmVzIHRoZSBkaWFsb2cuICovXG4gIGFyaWFEZXNjcmliZWRCeT86IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBJRCBvZiB0aGUgZWxlbWVudCB0aGF0IGxhYmVscyB0aGUgZGlhbG9nLiAqL1xuICBhcmlhTGFiZWxsZWRCeT86IHN0cmluZyB8IG51bGwgPSBudWxsO1xuXG4gIC8qKiBBcmlhIGxhYmVsIHRvIGFzc2lnbiB0byB0aGUgZGlhbG9nIGVsZW1lbnQgKi9cbiAgYXJpYUxhYmVsPzogc3RyaW5nIHwgbnVsbCA9IG51bGw7XG5cbiAgLyoqIFdoZXRoZXIgdGhlIGRpYWxvZyBzaG91bGQgZm9jdXMgdGhlIGZpcnN0IGZvY3VzYWJsZSBlbGVtZW50IG9uIG9wZW4uICovXG4gIGF1dG9Gb2N1cz86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIC8qKlxuICAgKiBXaGV0aGVyIHRoZSBkaWFsb2cgc2hvdWxkIHJlc3RvcmUgZm9jdXMgdG8gdGhlXG4gICAqIHByZXZpb3VzbHktZm9jdXNlZCBlbGVtZW50LCBhZnRlciBpdCdzIGNsb3NlZC5cbiAgICovXG4gIHJlc3RvcmVGb2N1cz86IGJvb2xlYW4gPSB0cnVlO1xuXG4gIC8qKiBTY3JvbGwgc3RyYXRlZ3kgdG8gYmUgdXNlZCBmb3IgdGhlIGRpYWxvZy4gKi9cbiAgc2Nyb2xsU3RyYXRlZ3k/OiBTY3JvbGxTdHJhdGVneTtcblxuICAvKipcbiAgICogV2hldGhlciB0aGUgZGlhbG9nIHNob3VsZCBjbG9zZSB3aGVuIHRoZSB1c2VyIGdvZXMgYmFja3dhcmRzL2ZvcndhcmRzIGluIGhpc3RvcnkuXG4gICAqIE5vdGUgdGhhdCB0aGlzIHVzdWFsbHkgZG9lc24ndCBpbmNsdWRlIGNsaWNraW5nIG9uIGxpbmtzICh1bmxlc3MgdGhlIHVzZXIgaXMgdXNpbmdcbiAgICogdGhlIGBIYXNoTG9jYXRpb25TdHJhdGVneWApLlxuICAgKi9cbiAgY2xvc2VPbk5hdmlnYXRpb24/OiBib29sZWFuID0gdHJ1ZTtcblxuICAvKiogQWx0ZXJuYXRlIGBDb21wb25lbnRGYWN0b3J5UmVzb2x2ZXJgIHRvIHVzZSB3aGVuIHJlc29sdmluZyB0aGUgYXNzb2NpYXRlZCBjb21wb25lbnQuICovXG4gIGNvbXBvbmVudEZhY3RvcnlSZXNvbHZlcj86IENvbXBvbmVudEZhY3RvcnlSZXNvbHZlcjtcblxuICAvLyBUT0RPKGplbGJvdXJuKTogYWRkIGNvbmZpZ3VyYXRpb24gZm9yIGxpZmVjeWNsZSBob29rcywgQVJJQSBsYWJlbGxpbmcuXG59XG4iXX0=