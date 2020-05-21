/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate } from "tslib";
import { NgModule } from '@angular/core';
import { MatSortHeader } from './sort-header';
import { MatSort } from './sort';
import { MAT_SORT_HEADER_INTL_PROVIDER } from './sort-header-intl';
import { CommonModule } from '@angular/common';
let MatSortModule = /** @class */ (() => {
    let MatSortModule = class MatSortModule {
    };
    MatSortModule = __decorate([
        NgModule({
            imports: [CommonModule],
            exports: [MatSort, MatSortHeader],
            declarations: [MatSort, MatSortHeader],
            providers: [MAT_SORT_HEADER_INTL_PROVIDER]
        })
    ], MatSortModule);
    return MatSortModule;
})();
export { MatSortModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic29ydC1tb2R1bGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvc29ydC9zb3J0LW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7O0FBRUgsT0FBTyxFQUFDLFFBQVEsRUFBQyxNQUFNLGVBQWUsQ0FBQztBQUN2QyxPQUFPLEVBQUMsYUFBYSxFQUFDLE1BQU0sZUFBZSxDQUFDO0FBQzVDLE9BQU8sRUFBQyxPQUFPLEVBQUMsTUFBTSxRQUFRLENBQUM7QUFDL0IsT0FBTyxFQUFDLDZCQUE2QixFQUFDLE1BQU0sb0JBQW9CLENBQUM7QUFDakUsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBUzdDO0lBQUEsSUFBYSxhQUFhLEdBQTFCLE1BQWEsYUFBYTtLQUFHLENBQUE7SUFBaEIsYUFBYTtRQU56QixRQUFRLENBQUM7WUFDUixPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUM7WUFDdkIsT0FBTyxFQUFFLENBQUMsT0FBTyxFQUFFLGFBQWEsQ0FBQztZQUNqQyxZQUFZLEVBQUUsQ0FBQyxPQUFPLEVBQUUsYUFBYSxDQUFDO1lBQ3RDLFNBQVMsRUFBRSxDQUFDLDZCQUE2QixDQUFDO1NBQzNDLENBQUM7T0FDVyxhQUFhLENBQUc7SUFBRCxvQkFBQztLQUFBO1NBQWhCLGFBQWEiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge01hdFNvcnRIZWFkZXJ9IGZyb20gJy4vc29ydC1oZWFkZXInO1xuaW1wb3J0IHtNYXRTb3J0fSBmcm9tICcuL3NvcnQnO1xuaW1wb3J0IHtNQVRfU09SVF9IRUFERVJfSU5UTF9QUk9WSURFUn0gZnJvbSAnLi9zb3J0LWhlYWRlci1pbnRsJztcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuXG5cbkBOZ01vZHVsZSh7XG4gIGltcG9ydHM6IFtDb21tb25Nb2R1bGVdLFxuICBleHBvcnRzOiBbTWF0U29ydCwgTWF0U29ydEhlYWRlcl0sXG4gIGRlY2xhcmF0aW9uczogW01hdFNvcnQsIE1hdFNvcnRIZWFkZXJdLFxuICBwcm92aWRlcnM6IFtNQVRfU09SVF9IRUFERVJfSU5UTF9QUk9WSURFUl1cbn0pXG5leHBvcnQgY2xhc3MgTWF0U29ydE1vZHVsZSB7fVxuIl19