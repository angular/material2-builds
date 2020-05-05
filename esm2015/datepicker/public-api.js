/**
 * @fileoverview added by tsickle
 * Generated from: src/material/datepicker/public-api.ts
 * @suppress {checkTypes,constantProperty,extraRequire,missingOverride,missingReturn,unusedPrivateMembers,uselessCode} checked by tsc
 */
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
export { MatDatepickerModule } from './datepicker-module';
export { MatCalendarHeader, MatCalendar } from './calendar';
export { MatCalendarCell, MatCalendarBody } from './calendar-body';
export { MatDatepicker } from './datepicker';
export { MAT_DATE_RANGE_SELECTION_STRATEGY, DefaultMatCalendarRangeStrategy } from './date-range-selection-strategy';
export { matDatepickerAnimations } from './datepicker-animations';
export { MAT_DATEPICKER_SCROLL_STRATEGY, MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY, MAT_DATEPICKER_SCROLL_STRATEGY_FACTORY_PROVIDER, MatDatepickerContent, } from './datepicker-base';
export { MatDatepickerInputEvent } from './datepicker-input-base';
export { MAT_DATEPICKER_VALUE_ACCESSOR, MAT_DATEPICKER_VALIDATORS, MatDatepickerInput, } from './datepicker-input';
export { MatDatepickerIntl } from './datepicker-intl';
export { MatDatepickerToggleIcon, MatDatepickerToggle } from './datepicker-toggle';
export { MatMonthView } from './month-view';
export { MatYearView } from './year-view';
export { MatDateRangeInput } from './date-range-input';
export { MatDateRangePicker } from './date-range-picker';
export { MAT_SINGLE_DATE_SELECTION_MODEL_FACTORY, MAT_RANGE_DATE_SELECTION_MODEL_FACTORY, DateRange, MatDateSelectionModel, MatSingleDateSelectionModel, MatRangeDateSelectionModel, MAT_SINGLE_DATE_SELECTION_MODEL_PROVIDER, MAT_RANGE_DATE_SELECTION_MODEL_PROVIDER } from './date-selection-model';
export { MatStartDate, MatEndDate } from './date-range-input-parts';
export { MatMultiYearView, yearsPerPage, yearsPerRow } from './multi-year-view';
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHVibGljLWFwaS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9kYXRlcGlja2VyL3B1YmxpYy1hcGkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBUUEsb0NBQWMscUJBQXFCLENBQUM7QUFDcEMsK0NBQWMsWUFBWSxDQUFDO0FBQzNCLGlEQUFjLGlCQUFpQixDQUFDO0FBQ2hDLDhCQUFjLGNBQWMsQ0FBQztBQUM3QixtRkFBYyxpQ0FBaUMsQ0FBQztBQUNoRCx3Q0FBYyx5QkFBeUIsQ0FBQztBQUN4QyxPQUFPLEVBQ0wsOEJBQThCLEVBQzlCLHNDQUFzQyxFQUN0QywrQ0FBK0MsRUFDL0Msb0JBQW9CLEdBR3JCLE1BQU0sbUJBQW1CLENBQUM7QUFDM0IsT0FBTyxFQUFDLHVCQUF1QixFQUFlLE1BQU0seUJBQXlCLENBQUM7QUFDOUUsT0FBTyxFQUNMLDZCQUE2QixFQUM3Qix5QkFBeUIsRUFDekIsa0JBQWtCLEdBQ25CLE1BQU0sb0JBQW9CLENBQUM7QUFDNUIsa0NBQWMsbUJBQW1CLENBQUM7QUFDbEMsNkRBQWMscUJBQXFCLENBQUM7QUFDcEMsNkJBQWMsY0FBYyxDQUFDO0FBQzdCLDRCQUFjLGFBQWEsQ0FBQztBQUM1QixrQ0FBYyxvQkFBb0IsQ0FBQztBQUNuQyxtQ0FBYyxxQkFBcUIsQ0FBQztBQUNwQyw4UUFBYyx3QkFBd0IsQ0FBQztBQUN2QyxPQUFPLEVBQUMsWUFBWSxFQUFFLFVBQVUsRUFBQyxNQUFNLDBCQUEwQixDQUFDO0FBQ2xFLE9BQU8sRUFBQyxnQkFBZ0IsRUFBRSxZQUFZLEVBQUUsV0FBVyxFQUFDLE1BQU0sbUJBQW1CLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi9kYXRlcGlja2VyLW1vZHVsZSc7XG5leHBvcnQgKiBmcm9tICcuL2NhbGVuZGFyJztcbmV4cG9ydCAqIGZyb20gJy4vY2FsZW5kYXItYm9keSc7XG5leHBvcnQgKiBmcm9tICcuL2RhdGVwaWNrZXInO1xuZXhwb3J0ICogZnJvbSAnLi9kYXRlLXJhbmdlLXNlbGVjdGlvbi1zdHJhdGVneSc7XG5leHBvcnQgKiBmcm9tICcuL2RhdGVwaWNrZXItYW5pbWF0aW9ucyc7XG5leHBvcnQge1xuICBNQVRfREFURVBJQ0tFUl9TQ1JPTExfU1RSQVRFR1ksXG4gIE1BVF9EQVRFUElDS0VSX1NDUk9MTF9TVFJBVEVHWV9GQUNUT1JZLFxuICBNQVRfREFURVBJQ0tFUl9TQ1JPTExfU1RSQVRFR1lfRkFDVE9SWV9QUk9WSURFUixcbiAgTWF0RGF0ZXBpY2tlckNvbnRlbnQsXG4gIERhdGVwaWNrZXJEcm9wZG93blBvc2l0aW9uWCxcbiAgRGF0ZXBpY2tlckRyb3Bkb3duUG9zaXRpb25ZLFxufSBmcm9tICcuL2RhdGVwaWNrZXItYmFzZSc7XG5leHBvcnQge01hdERhdGVwaWNrZXJJbnB1dEV2ZW50LCBEYXRlRmlsdGVyRm59IGZyb20gJy4vZGF0ZXBpY2tlci1pbnB1dC1iYXNlJztcbmV4cG9ydCB7XG4gIE1BVF9EQVRFUElDS0VSX1ZBTFVFX0FDQ0VTU09SLFxuICBNQVRfREFURVBJQ0tFUl9WQUxJREFUT1JTLFxuICBNYXREYXRlcGlja2VySW5wdXQsXG59IGZyb20gJy4vZGF0ZXBpY2tlci1pbnB1dCc7XG5leHBvcnQgKiBmcm9tICcuL2RhdGVwaWNrZXItaW50bCc7XG5leHBvcnQgKiBmcm9tICcuL2RhdGVwaWNrZXItdG9nZ2xlJztcbmV4cG9ydCAqIGZyb20gJy4vbW9udGgtdmlldyc7XG5leHBvcnQgKiBmcm9tICcuL3llYXItdmlldyc7XG5leHBvcnQgKiBmcm9tICcuL2RhdGUtcmFuZ2UtaW5wdXQnO1xuZXhwb3J0ICogZnJvbSAnLi9kYXRlLXJhbmdlLXBpY2tlcic7XG5leHBvcnQgKiBmcm9tICcuL2RhdGUtc2VsZWN0aW9uLW1vZGVsJztcbmV4cG9ydCB7TWF0U3RhcnREYXRlLCBNYXRFbmREYXRlfSBmcm9tICcuL2RhdGUtcmFuZ2UtaW5wdXQtcGFydHMnO1xuZXhwb3J0IHtNYXRNdWx0aVllYXJWaWV3LCB5ZWFyc1BlclBhZ2UsIHllYXJzUGVyUm93fSBmcm9tICcuL211bHRpLXllYXItdmlldyc7XG4iXX0=