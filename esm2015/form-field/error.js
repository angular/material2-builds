/**
 * @fileoverview added by tsickle
 * @suppress {checkTypes,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Directive, Input } from '@angular/core';
/** @type {?} */
let nextUniqueId = 0;
/**
 * Single error message to be shown underneath the form field.
 */
export class MatError {
    constructor() {
        this.id = `mat-error-${nextUniqueId++}`;
    }
}
MatError.decorators = [
    { type: Directive, args: [{
                selector: 'mat-error',
                host: {
                    'class': 'mat-error',
                    'role': 'alert',
                    '[attr.id]': 'id',
                }
            },] }
];
MatError.propDecorators = {
    id: [{ type: Input }]
};
if (false) {
    /** @type {?} */
    MatError.prototype.id;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXJyb3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvZm9ybS1maWVsZC9lcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQVFBLE9BQU8sRUFBQyxTQUFTLEVBQUUsS0FBSyxFQUFDLE1BQU0sZUFBZSxDQUFDOztJQUczQyxZQUFZLEdBQUcsQ0FBQzs7OztBQVlwQixNQUFNLE9BQU8sUUFBUTtJQVJyQjtRQVNXLE9BQUUsR0FBVyxhQUFhLFlBQVksRUFBRSxFQUFFLENBQUM7SUFDdEQsQ0FBQzs7O1lBVkEsU0FBUyxTQUFDO2dCQUNULFFBQVEsRUFBRSxXQUFXO2dCQUNyQixJQUFJLEVBQUU7b0JBQ0osT0FBTyxFQUFFLFdBQVc7b0JBQ3BCLE1BQU0sRUFBRSxPQUFPO29CQUNmLFdBQVcsRUFBRSxJQUFJO2lCQUNsQjthQUNGOzs7aUJBRUUsS0FBSzs7OztJQUFOLHNCQUFvRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0RpcmVjdGl2ZSwgSW5wdXR9IGZyb20gJ0Bhbmd1bGFyL2NvcmUnO1xuXG5cbmxldCBuZXh0VW5pcXVlSWQgPSAwO1xuXG5cbi8qKiBTaW5nbGUgZXJyb3IgbWVzc2FnZSB0byBiZSBzaG93biB1bmRlcm5lYXRoIHRoZSBmb3JtIGZpZWxkLiAqL1xuQERpcmVjdGl2ZSh7XG4gIHNlbGVjdG9yOiAnbWF0LWVycm9yJyxcbiAgaG9zdDoge1xuICAgICdjbGFzcyc6ICdtYXQtZXJyb3InLFxuICAgICdyb2xlJzogJ2FsZXJ0JyxcbiAgICAnW2F0dHIuaWRdJzogJ2lkJyxcbiAgfVxufSlcbmV4cG9ydCBjbGFzcyBNYXRFcnJvciB7XG4gIEBJbnB1dCgpIGlkOiBzdHJpbmcgPSBgbWF0LWVycm9yLSR7bmV4dFVuaXF1ZUlkKyt9YDtcbn1cbiJdfQ==