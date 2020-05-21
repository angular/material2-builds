/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata } from "tslib";
import { Directive, Input } from '@angular/core';
let nextUniqueId = 0;
/** Hint text to be shown underneath the form field control. */
let MatHint = /** @class */ (() => {
    let MatHint = class MatHint {
        constructor() {
            /** Whether to align the hint label at the start or end of the line. */
            this.align = 'start';
            /** Unique ID for the hint. Used for the aria-describedby on the form field control. */
            this.id = `mat-hint-${nextUniqueId++}`;
        }
    };
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], MatHint.prototype, "align", void 0);
    __decorate([
        Input(),
        __metadata("design:type", String)
    ], MatHint.prototype, "id", void 0);
    MatHint = __decorate([
        Directive({
            selector: 'mat-hint',
            host: {
                'class': 'mat-hint',
                '[class.mat-right]': 'align == "end"',
                '[attr.id]': 'id',
                // Remove align attribute to prevent it from interfering with layout.
                '[attr.align]': 'null',
            }
        })
    ], MatHint);
    return MatHint;
})();
export { MatHint };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaGludC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9mb3JtLWZpZWxkL2hpbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBRy9DLElBQUksWUFBWSxHQUFHLENBQUMsQ0FBQztBQUdyQiwrREFBK0Q7QUFXL0Q7SUFBQSxJQUFhLE9BQU8sR0FBcEIsTUFBYSxPQUFPO1FBQXBCO1lBQ0UsdUVBQXVFO1lBQzlELFVBQUssR0FBb0IsT0FBTyxDQUFDO1lBRTFDLHVGQUF1RjtZQUM5RSxPQUFFLEdBQVcsWUFBWSxZQUFZLEVBQUUsRUFBRSxDQUFDO1FBQ3JELENBQUM7S0FBQSxDQUFBO0lBSlU7UUFBUixLQUFLLEVBQUU7OzBDQUFrQztJQUdqQztRQUFSLEtBQUssRUFBRTs7dUNBQTJDO0lBTHhDLE9BQU87UUFWbkIsU0FBUyxDQUFDO1lBQ1QsUUFBUSxFQUFFLFVBQVU7WUFDcEIsSUFBSSxFQUFFO2dCQUNKLE9BQU8sRUFBRSxVQUFVO2dCQUNuQixtQkFBbUIsRUFBRSxnQkFBZ0I7Z0JBQ3JDLFdBQVcsRUFBRSxJQUFJO2dCQUNqQixxRUFBcUU7Z0JBQ3JFLGNBQWMsRUFBRSxNQUFNO2FBQ3ZCO1NBQ0YsQ0FBQztPQUNXLE9BQU8sQ0FNbkI7SUFBRCxjQUFDO0tBQUE7U0FOWSxPQUFPIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBAbGljZW5zZVxuICogQ29weXJpZ2h0IEdvb2dsZSBMTEMgQWxsIFJpZ2h0cyBSZXNlcnZlZC5cbiAqXG4gKiBVc2Ugb2YgdGhpcyBzb3VyY2UgY29kZSBpcyBnb3Zlcm5lZCBieSBhbiBNSVQtc3R5bGUgbGljZW5zZSB0aGF0IGNhbiBiZVxuICogZm91bmQgaW4gdGhlIExJQ0VOU0UgZmlsZSBhdCBodHRwczovL2FuZ3VsYXIuaW8vbGljZW5zZVxuICovXG5cbmltcG9ydCB7RGlyZWN0aXZlLCBJbnB1dH0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cblxubGV0IG5leHRVbmlxdWVJZCA9IDA7XG5cblxuLyoqIEhpbnQgdGV4dCB0byBiZSBzaG93biB1bmRlcm5lYXRoIHRoZSBmb3JtIGZpZWxkIGNvbnRyb2wuICovXG5ARGlyZWN0aXZlKHtcbiAgc2VsZWN0b3I6ICdtYXQtaGludCcsXG4gIGhvc3Q6IHtcbiAgICAnY2xhc3MnOiAnbWF0LWhpbnQnLFxuICAgICdbY2xhc3MubWF0LXJpZ2h0XSc6ICdhbGlnbiA9PSBcImVuZFwiJyxcbiAgICAnW2F0dHIuaWRdJzogJ2lkJyxcbiAgICAvLyBSZW1vdmUgYWxpZ24gYXR0cmlidXRlIHRvIHByZXZlbnQgaXQgZnJvbSBpbnRlcmZlcmluZyB3aXRoIGxheW91dC5cbiAgICAnW2F0dHIuYWxpZ25dJzogJ251bGwnLFxuICB9XG59KVxuZXhwb3J0IGNsYXNzIE1hdEhpbnQge1xuICAvKiogV2hldGhlciB0byBhbGlnbiB0aGUgaGludCBsYWJlbCBhdCB0aGUgc3RhcnQgb3IgZW5kIG9mIHRoZSBsaW5lLiAqL1xuICBASW5wdXQoKSBhbGlnbjogJ3N0YXJ0JyB8ICdlbmQnID0gJ3N0YXJ0JztcblxuICAvKiogVW5pcXVlIElEIGZvciB0aGUgaGludC4gVXNlZCBmb3IgdGhlIGFyaWEtZGVzY3JpYmVkYnkgb24gdGhlIGZvcm0gZmllbGQgY29udHJvbC4gKi9cbiAgQElucHV0KCkgaWQ6IHN0cmluZyA9IGBtYXQtaGludC0ke25leHRVbmlxdWVJZCsrfWA7XG59XG4iXX0=