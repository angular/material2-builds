/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { __decorate, __metadata, __param } from "tslib";
import { Platform } from '@angular/cdk/platform';
import { Inject, Injectable, Optional } from '@angular/core';
import { DateAdapter, MAT_DATE_LOCALE } from './date-adapter';
// TODO(mmalerba): Remove when we no longer support safari 9.
/** Whether the browser supports the Intl API. */
let SUPPORTS_INTL_API;
// We need a try/catch around the reference to `Intl`, because accessing it in some cases can
// cause IE to throw. These cases are tied to particular versions of Windows and can happen if
// the consumer is providing a polyfilled `Map`. See:
// https://github.com/Microsoft/ChakraCore/issues/3189
// https://github.com/angular/components/issues/15687
try {
    SUPPORTS_INTL_API = typeof Intl != 'undefined';
}
catch (_a) {
    SUPPORTS_INTL_API = false;
}
/** The default month names to use if Intl API is not available. */
const DEFAULT_MONTH_NAMES = {
    'long': [
        'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September',
        'October', 'November', 'December'
    ],
    'short': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    'narrow': ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']
};
const ɵ0 = i => String(i + 1);
/** The default date names to use if Intl API is not available. */
const DEFAULT_DATE_NAMES = range(31, ɵ0);
/** The default day of the week names to use if Intl API is not available. */
const DEFAULT_DAY_OF_WEEK_NAMES = {
    'long': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    'short': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
    'narrow': ['S', 'M', 'T', 'W', 'T', 'F', 'S']
};
/**
 * Matches strings that have the form of a valid RFC 3339 string
 * (https://tools.ietf.org/html/rfc3339). Note that the string may not actually be a valid date
 * because the regex will match strings an with out of bounds month, date, etc.
 */
const ISO_8601_REGEX = /^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|(?:(?:\+|-)\d{2}:\d{2}))?)?$/;
/** Creates an array and fills it with values. */
function range(length, valueFunction) {
    const valuesArray = Array(length);
    for (let i = 0; i < length; i++) {
        valuesArray[i] = valueFunction(i);
    }
    return valuesArray;
}
/** Adapts the native JS Date for use with cdk-based components that work with dates. */
let NativeDateAdapter = /** @class */ (() => {
    let NativeDateAdapter = class NativeDateAdapter extends DateAdapter {
        constructor(matDateLocale, platform) {
            super();
            /**
             * Whether to use `timeZone: 'utc'` with `Intl.DateTimeFormat` when formatting dates.
             * Without this `Intl.DateTimeFormat` sometimes chooses the wrong timeZone, which can throw off
             * the result. (e.g. in the en-US locale `new Date(1800, 7, 14).toLocaleDateString()`
             * will produce `'8/13/1800'`.
             *
             * TODO(mmalerba): drop this variable. It's not being used in the code right now. We're now
             * getting the string representation of a Date object from its utc representation. We're keeping
             * it here for sometime, just for precaution, in case we decide to revert some of these changes
             * though.
             */
            this.useUtcForDisplay = true;
            super.setLocale(matDateLocale);
            // IE does its own time zone correction, so we disable this on IE.
            this.useUtcForDisplay = !platform.TRIDENT;
            this._clampDate = platform.TRIDENT || platform.EDGE;
        }
        getYear(date) {
            return date.getFullYear();
        }
        getMonth(date) {
            return date.getMonth();
        }
        getDate(date) {
            return date.getDate();
        }
        getDayOfWeek(date) {
            return date.getDay();
        }
        getMonthNames(style) {
            if (SUPPORTS_INTL_API) {
                const dtf = new Intl.DateTimeFormat(this.locale, { month: style, timeZone: 'utc' });
                return range(12, i => this._stripDirectionalityCharacters(this._format(dtf, new Date(2017, i, 1))));
            }
            return DEFAULT_MONTH_NAMES[style];
        }
        getDateNames() {
            if (SUPPORTS_INTL_API) {
                const dtf = new Intl.DateTimeFormat(this.locale, { day: 'numeric', timeZone: 'utc' });
                return range(31, i => this._stripDirectionalityCharacters(this._format(dtf, new Date(2017, 0, i + 1))));
            }
            return DEFAULT_DATE_NAMES;
        }
        getDayOfWeekNames(style) {
            if (SUPPORTS_INTL_API) {
                const dtf = new Intl.DateTimeFormat(this.locale, { weekday: style, timeZone: 'utc' });
                return range(7, i => this._stripDirectionalityCharacters(this._format(dtf, new Date(2017, 0, i + 1))));
            }
            return DEFAULT_DAY_OF_WEEK_NAMES[style];
        }
        getYearName(date) {
            if (SUPPORTS_INTL_API) {
                const dtf = new Intl.DateTimeFormat(this.locale, { year: 'numeric', timeZone: 'utc' });
                return this._stripDirectionalityCharacters(this._format(dtf, date));
            }
            return String(this.getYear(date));
        }
        getFirstDayOfWeek() {
            // We can't tell using native JS Date what the first day of the week is, we default to Sunday.
            return 0;
        }
        getNumDaysInMonth(date) {
            return this.getDate(this._createDateWithOverflow(this.getYear(date), this.getMonth(date) + 1, 0));
        }
        clone(date) {
            return new Date(date.getTime());
        }
        createDate(year, month, date) {
            // Check for invalid month and date (except upper bound on date which we have to check after
            // creating the Date).
            if (month < 0 || month > 11) {
                throw Error(`Invalid month index "${month}". Month index has to be between 0 and 11.`);
            }
            if (date < 1) {
                throw Error(`Invalid date "${date}". Date has to be greater than 0.`);
            }
            let result = this._createDateWithOverflow(year, month, date);
            // Check that the date wasn't above the upper bound for the month, causing the month to overflow
            if (result.getMonth() != month) {
                throw Error(`Invalid date "${date}" for month with index "${month}".`);
            }
            return result;
        }
        today() {
            return new Date();
        }
        parse(value) {
            // We have no way using the native JS Date to set the parse format or locale, so we ignore these
            // parameters.
            if (typeof value == 'number') {
                return new Date(value);
            }
            return value ? new Date(Date.parse(value)) : null;
        }
        format(date, displayFormat) {
            if (!this.isValid(date)) {
                throw Error('NativeDateAdapter: Cannot format invalid date.');
            }
            if (SUPPORTS_INTL_API) {
                // On IE and Edge the i18n API will throw a hard error that can crash the entire app
                // if we attempt to format a date whose year is less than 1 or greater than 9999.
                if (this._clampDate && (date.getFullYear() < 1 || date.getFullYear() > 9999)) {
                    date = this.clone(date);
                    date.setFullYear(Math.max(1, Math.min(9999, date.getFullYear())));
                }
                displayFormat = Object.assign(Object.assign({}, displayFormat), { timeZone: 'utc' });
                const dtf = new Intl.DateTimeFormat(this.locale, displayFormat);
                return this._stripDirectionalityCharacters(this._format(dtf, date));
            }
            return this._stripDirectionalityCharacters(date.toDateString());
        }
        addCalendarYears(date, years) {
            return this.addCalendarMonths(date, years * 12);
        }
        addCalendarMonths(date, months) {
            let newDate = this._createDateWithOverflow(this.getYear(date), this.getMonth(date) + months, this.getDate(date));
            // It's possible to wind up in the wrong month if the original month has more days than the new
            // month. In this case we want to go to the last day of the desired month.
            // Note: the additional + 12 % 12 ensures we end up with a positive number, since JS % doesn't
            // guarantee this.
            if (this.getMonth(newDate) != ((this.getMonth(date) + months) % 12 + 12) % 12) {
                newDate = this._createDateWithOverflow(this.getYear(newDate), this.getMonth(newDate), 0);
            }
            return newDate;
        }
        addCalendarDays(date, days) {
            return this._createDateWithOverflow(this.getYear(date), this.getMonth(date), this.getDate(date) + days);
        }
        toIso8601(date) {
            return [
                date.getUTCFullYear(),
                this._2digit(date.getUTCMonth() + 1),
                this._2digit(date.getUTCDate())
            ].join('-');
        }
        /**
         * Returns the given value if given a valid Date or null. Deserializes valid ISO 8601 strings
         * (https://www.ietf.org/rfc/rfc3339.txt) into valid Dates and empty string into null. Returns an
         * invalid date for all other values.
         */
        deserialize(value) {
            if (typeof value === 'string') {
                if (!value) {
                    return null;
                }
                // The `Date` constructor accepts formats other than ISO 8601, so we need to make sure the
                // string is the right format first.
                if (ISO_8601_REGEX.test(value)) {
                    let date = new Date(value);
                    if (this.isValid(date)) {
                        return date;
                    }
                }
            }
            return super.deserialize(value);
        }
        isDateInstance(obj) {
            return obj instanceof Date;
        }
        isValid(date) {
            return !isNaN(date.getTime());
        }
        invalid() {
            return new Date(NaN);
        }
        /** Creates a date but allows the month and date to overflow. */
        _createDateWithOverflow(year, month, date) {
            const result = new Date(year, month, date);
            // We need to correct for the fact that JS native Date treats years in range [0, 99] as
            // abbreviations for 19xx.
            if (year >= 0 && year < 100) {
                result.setFullYear(this.getYear(result) - 1900);
            }
            return result;
        }
        /**
         * Pads a number to make it two digits.
         * @param n The number to pad.
         * @returns The padded number.
         */
        _2digit(n) {
            return ('00' + n).slice(-2);
        }
        /**
         * Strip out unicode LTR and RTL characters. Edge and IE insert these into formatted dates while
         * other browsers do not. We remove them to make output consistent and because they interfere with
         * date parsing.
         * @param str The string to strip direction characters from.
         * @returns The stripped string.
         */
        _stripDirectionalityCharacters(str) {
            return str.replace(/[\u200e\u200f]/g, '');
        }
        /**
         * When converting Date object to string, javascript built-in functions may return wrong
         * results because it applies its internal DST rules. The DST rules around the world change
         * very frequently, and the current valid rule is not always valid in previous years though.
         * We work around this problem building a new Date object which has its internal UTC
         * representation with the local date and time.
         * @param dtf Intl.DateTimeFormat object, containg the desired string format. It must have
         *    timeZone set to 'utc' to work fine.
         * @param date Date from which we want to get the string representation according to dtf
         * @returns A Date object with its UTC representation based on the passed in date info
         */
        _format(dtf, date) {
            const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()));
            return dtf.format(d);
        }
    };
    NativeDateAdapter = __decorate([
        Injectable(),
        __param(0, Optional()), __param(0, Inject(MAT_DATE_LOCALE)),
        __metadata("design:paramtypes", [String, Platform])
    ], NativeDateAdapter);
    return NativeDateAdapter;
})();
export { NativeDateAdapter };
export { ɵ0 };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmF0aXZlLWRhdGUtYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uLy4uLy4uL3NyYy9tYXRlcmlhbC9jb3JlL2RhdGV0aW1lL25hdGl2ZS1kYXRlLWFkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HOztBQUVILE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSx1QkFBdUIsQ0FBQztBQUMvQyxPQUFPLEVBQUMsTUFBTSxFQUFFLFVBQVUsRUFBRSxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDM0QsT0FBTyxFQUFDLFdBQVcsRUFBRSxlQUFlLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUU1RCw2REFBNkQ7QUFDN0QsaURBQWlEO0FBQ2pELElBQUksaUJBQTBCLENBQUM7QUFFL0IsNkZBQTZGO0FBQzdGLDhGQUE4RjtBQUM5RixxREFBcUQ7QUFDckQsc0RBQXNEO0FBQ3RELHFEQUFxRDtBQUNyRCxJQUFJO0lBQ0YsaUJBQWlCLEdBQUcsT0FBTyxJQUFJLElBQUksV0FBVyxDQUFDO0NBQ2hEO0FBQUMsV0FBTTtJQUNOLGlCQUFpQixHQUFHLEtBQUssQ0FBQztDQUMzQjtBQUVELG1FQUFtRTtBQUNuRSxNQUFNLG1CQUFtQixHQUFHO0lBQzFCLE1BQU0sRUFBRTtRQUNOLFNBQVMsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsV0FBVztRQUNyRixTQUFTLEVBQUUsVUFBVSxFQUFFLFVBQVU7S0FDbEM7SUFDRCxPQUFPLEVBQUUsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLEtBQUssQ0FBQztJQUM3RixRQUFRLEVBQUUsQ0FBQyxHQUFH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LEVBQUUsSUFBSSxDQUFDLFFBQVEsRUFBRSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxJQUFJLENBQUMsUUFBUSxFQUFFLEVBQ3BFLElBQUksQ0FBQyxVQUFVLEVBQUUsRUFBRSxJQUFJLENBQUMsVUFBVSxFQUFFLEVBQUUsSUFBSSxDQUFDLGVBQWUsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUNuRSxPQUFPLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdkIsQ0FBQztLQUNGLENBQUE7SUFwUVksaUJBQWlCO1FBRDdCLFVBQVUsRUFBRTtRQWtCRSxXQUFBLFFBQVEsRUFBRSxDQUFBLEVBQUUsV0FBQSxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUE7aURBQWtDLFFBQVE7T0FqQi9FLGlCQUFpQixDQW9RN0I7SUFBRCx3QkFBQztLQUFBO1NBcFFZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge1BsYXRmb3JtfSBmcm9tICdAYW5ndWxhci9jZGsvcGxhdGZvcm0nO1xuaW1wb3J0IHtJbmplY3QsIEluamVjdGFibGUsIE9wdGlvbmFsfSBmcm9tICdAYW5ndWxhci9jb3JlJztcbmltcG9ydCB7RGF0ZUFkYXB0ZXIsIE1BVF9EQVRFX0xPQ0FMRX0gZnJvbSAnLi9kYXRlLWFkYXB0ZXInO1xuXG4vLyBUT0RPKG1tYWxlcmJhKTogUmVtb3ZlIHdoZW4gd2Ugbm8gbG9uZ2VyIHN1cHBvcnQgc2FmYXJpIDkuXG4vKiogV2hldGhlciB0aGUgYnJvd3NlciBzdXBwb3J0cyB0aGUgSW50bCBBUEkuICovXG5sZXQgU1VQUE9SVFNfSU5UTF9BUEk6IGJvb2xlYW47XG5cbi8vIFdlIG5lZWQgYSB0cnkvY2F0Y2ggYXJvdW5kIHRoZSByZWZlcmVuY2UgdG8gYEludGxgLCBiZWNhdXNlIGFjY2Vzc2luZyBpdCBpbiBzb21lIGNhc2VzIGNhblxuLy8gY2F1c2UgSUUgdG8gdGhyb3cuIFRoZXNlIGNhc2VzIGFyZSB0aWVkIHRvIHBhcnRpY3VsYXIgdmVyc2lvbnMgb2YgV2luZG93cyBhbmQgY2FuIGhhcHBlbiBpZlxuLy8gdGhlIGNvbnN1bWVyIGlzIHByb3ZpZGluZyBhIHBvbHlmaWxsZWQgYE1hcGAuIFNlZTpcbi8vIGh0dHBzOi8vZ2l0aHViLmNvbS9NaWNyb3NvZnQvQ2hha3JhQ29yZS9pc3N1ZXMvMzE4OVxuLy8gaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMTU2ODdcbnRyeSB7XG4gIFNVUFBPUlRTX0lOVExfQVBJID0gdHlwZW9mIEludGwgIT0gJ3VuZGVmaW5lZCc7XG59IGNhdGNoIHtcbiAgU1VQUE9SVFNfSU5UTF9BUEkgPSBmYWxzZTtcbn1cblxuLyoqIFRoZSBkZWZhdWx0IG1vbnRoIG5hbWVzIHRvIHVzZSBpZiBJbnRsIEFQSSBpcyBub3QgYXZhaWxhYmxlLiAqL1xuY29uc3QgREVGQVVMVF9NT05USF9OQU1FUyA9IHtcbiAgJ2xvbmcnOiBbXG4gICAgJ0phbnVhcnknLCAnRmVicnVhcnknLCAnTWFyY2gnLCAnQXByaWwnLCAnTWF5JywgJ0p1bmUnLCAnSnVseScsICdBdWd1c3QnLCAnU2VwdGVtYmVyJyxcbiAgICAnT2N0b2JlcicsICdOb3ZlbWJlcicsICdEZWNlbWJlcidcbiAgXSxcbiAgJ3Nob3J0JzogWydKYW4nLCAnRmViJywgJ01hcicsICdBcHInLCAnTWF5JywgJ0p1bicsICdKdWwnLCAnQXVnJywgJ1NlcCcsICdPY3QnLCAnTm92JywgJ0RlYyddLFxuICAnbmFycm93JzogWydKJywgJ0YnLCAnTScsICdBJywgJ00nLCAnSicsICdKJywgJ0EnLCAnUycsICdPJywgJ04nLCAnRCddXG59O1xuXG5cbi8qKiBUaGUgZGVmYXVsdCBkYXRlIG5hbWVzIHRvIHVzZSBpZiBJbnRsIEFQSSBpcyBub3QgYXZhaWxhYmxlLiAqL1xuY29uc3QgREVGQVVMVF9EQVRFX05BTUVTID0gcmFuZ2UoMzEsIGkgPT4gU3RyaW5nKGkgKyAxKSk7XG5cblxuLyoqIFRoZSBkZWZhdWx0IGRheSBvZiB0aGUgd2VlayBuYW1lcyB0byB1c2UgaWYgSW50bCBBUEkgaXMgbm90IGF2YWlsYWJsZS4gKi9cbmNvbnN0IERFRkFVTFRfREFZX09GX1dFRUtfTkFNRVMgPSB7XG4gICdsb25nJzogWydTdW5kYXknLCAnTW9uZGF5JywgJ1R1ZXNkYXknLCAnV2VkbmVzZGF5JywgJ1RodXJzZGF5JywgJ0ZyaWRheScsICdTYXR1cmRheSddLFxuICAnc2hvcnQnOiBbJ1N1bicsICdNb24nLCAnVHVlJywgJ1dlZCcsICdUaHUnLCAnRnJpJywgJ1NhdCddLFxuICAnbmFycm93JzogWydTJywgJ00nLCAnVCcsICdXJywgJ1QnLCAnRicsICdTJ11cbn07XG5cblxuLyoqXG4gKiBNYXRjaGVzIHN0cmluZ3MgdGhhdCBoYXZlIHRoZSBmb3JtIG9mIGEgdmFsaWQgUkZDIDMzMzkgc3RyaW5nXG4gKiAoaHR0cHM6Ly90b29scy5pZXRmLm9yZy9odG1sL3JmYzMzMzkpLiBOb3RlIHRoYXQgdGhlIHN0cmluZyBtYXkgbm90IGFjdHVhbGx5IGJlIGEgdmFsaWQgZGF0ZVxuICogYmVjYXVzZSB0aGUgcmVnZXggd2lsbCBtYXRjaCBzdHJpbmdzIGFuIHdpdGggb3V0IG9mIGJvdW5kcyBtb250aCwgZGF0ZSwgZXRjLlxuICovXG5jb25zdCBJU09fODYwMV9SRUdFWCA9XG4gICAgL15cXGR7NH0tXFxkezJ9LVxcZHsyfSg/OlRcXGR7Mn06XFxkezJ9OlxcZHsyfSg/OlxcLlxcZCspPyg/Olp8KD86KD86XFwrfC0pXFxkezJ9OlxcZHsyfSkpPyk/JC87XG5cblxuLyoqIENyZWF0ZXMgYW4gYXJyYXkgYW5kIGZpbGxzIGl0IHdpdGggdmFsdWVzLiAqL1xuZnVuY3Rpb24gcmFuZ2U8VD4obGVuZ3RoOiBudW1iZXIsIHZhbHVlRnVuY3Rpb246IChpbmRleDogbnVtYmVyKSA9PiBUKTogVFtdIHtcbiAgY29uc3QgdmFsdWVzQXJyYXkgPSBBcnJheShsZW5ndGgpO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgdmFsdWVzQXJyYXlbaV0gPSB2YWx1ZUZ1bmN0aW9uKGkpO1xuICB9XG4gIHJldHVybiB2YWx1ZXNBcnJheTtcbn1cblxuLyoqIEFkYXB0cyB0aGUgbmF0aXZlIEpTIERhdGUgZm9yIHVzZSB3aXRoIGNkay1iYXNlZCBjb21wb25lbnRzIHRoYXQgd29yayB3aXRoIGRhdGVzLiAqL1xuQEluamVjdGFibGUoKVxuZXhwb3J0IGNsYXNzIE5hdGl2ZURhdGVBZGFwdGVyIGV4dGVuZHMgRGF0ZUFkYXB0ZXI8RGF0ZT4ge1xuICAvKiogV2hldGhlciB0byBjbGFtcCB0aGUgZGF0ZSBiZXR3ZWVuIDEgYW5kIDk5OTkgdG8gYXZvaWQgSUUgYW5kIEVkZ2UgZXJyb3JzLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9jbGFtcERhdGU6IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIFdoZXRoZXIgdG8gdXNlIGB0aW1lWm9uZTogJ3V0YydgIHdpdGggYEludGwuRGF0ZVRpbWVGb3JtYXRgIHdoZW4gZm9ybWF0dGluZyBkYXRlcy5cbiAgICogV2l0aG91dCB0aGlzIGBJbnRsLkRhdGVUaW1lRm9ybWF0YCBzb21ldGltZXMgY2hvb3NlcyB0aGUgd3JvbmcgdGltZVpvbmUsIHdoaWNoIGNhbiB0aHJvdyBvZmZcbiAgICogdGhlIHJlc3VsdC4gKGUuZy4gaW4gdGhlIGVuLVVTIGxvY2FsZSBgbmV3IERhdGUoMTgwMCwgNywgMTQpLnRvTG9jYWxlRGF0ZVN0cmluZygpYFxuICAgKiB3aWxsIHByb2R1Y2UgYCc4LzEzLzE4MDAnYC5cbiAgICpcbiAgICogVE9ETyhtbWFsZXJiYSk6IGRyb3AgdGhpcyB2YXJpYWJsZS4gSXQncyBub3QgYmVpbmcgdXNlZCBpbiB0aGUgY29kZSByaWdodCBub3cuIFdlJ3JlIG5vd1xuICAgKiBnZXR0aW5nIHRoZSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBEYXRlIG9iamVjdCBmcm9tIGl0cyB1dGMgcmVwcmVzZW50YXRpb24uIFdlJ3JlIGtlZXBpbmdcbiAgICogaXQgaGVyZSBmb3Igc29tZXRpbWUsIGp1c3QgZm9yIHByZWNhdXRpb24sIGluIGNhc2Ugd2UgZGVjaWRlIHRvIHJldmVydCBzb21lIG9mIHRoZXNlIGNoYW5nZXNcbiAgICogdGhvdWdoLlxuICAgKi9cbiAgdXNlVXRjRm9yRGlzcGxheTogYm9vbGVhbiA9IHRydWU7XG5cbiAgY29uc3RydWN0b3IoQE9wdGlvbmFsKCkgQEluamVjdChNQVRfREFURV9MT0NBTEUpIG1hdERhdGVMb2NhbGU6IHN0cmluZywgcGxhdGZvcm06IFBsYXRmb3JtKSB7XG4gICAgc3VwZXIoKTtcbiAgICBzdXBlci5zZXRMb2NhbGUobWF0RGF0ZUxvY2FsZSk7XG5cbiAgICAvLyBJRSBkb2VzIGl0cyBvd24gdGltZSB6b25lIGNvcnJlY3Rpb24sIHNvIHdlIGRpc2FibGUgdGhpcyBvbiBJRS5cbiAgICB0aGlzLnVzZVV0Y0ZvckRpc3BsYXkgPSAhcGxhdGZvcm0uVFJJREVOVDtcbiAgICB0aGlzLl9jbGFtcERhdGUgPSBwbGF0Zm9ybS5UUklERU5UIHx8IHBsYXRmb3JtLkVER0U7XG4gIH1cblxuICBnZXRZZWFyKGRhdGU6IERhdGUpOiBudW1iZXIge1xuICAgIHJldHVybiBkYXRlLmdldEZ1bGxZZWFyKCk7XG4gIH1cblxuICBnZXRNb250aChkYXRlOiBEYXRlKTogbnVtYmVyIHtcbiAgICByZXR1cm4gZGF0ZS5nZXRNb250aCgpO1xuICB9XG5cbiAgZ2V0RGF0ZShkYXRlOiBEYXRlKTogbnVtYmVyIHtcbiAgICByZXR1cm4gZGF0ZS5nZXREYXRlKCk7XG4gIH1cblxuICBnZXREYXlPZldlZWsoZGF0ZTogRGF0ZSk6IG51bWJlciB7XG4gICAgcmV0dXJuIGRhdGUuZ2V0RGF5KCk7XG4gIH1cblxuICBnZXRNb250aE5hbWVzKHN0eWxlOiAnbG9uZycgfCAnc2hvcnQnIHwgJ25hcnJvdycpOiBzdHJpbmdbXSB7XG4gICAgaWYgKFNVUFBPUlRTX0lOVExfQVBJKSB7XG4gICAgICBjb25zdCBkdGYgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCh0aGlzLmxvY2FsZSwge21vbnRoOiBzdHlsZSwgdGltZVpvbmU6ICd1dGMnfSk7XG4gICAgICByZXR1cm4gcmFuZ2UoMTIsIGkgPT5cbiAgICAgICAgICB0aGlzLl9zdHJpcERpcmVjdGlvbmFsaXR5Q2hhcmFjdGVycyh0aGlzLl9mb3JtYXQoZHRmLCBuZXcgRGF0ZSgyMDE3LCBpLCAxKSkpKTtcbiAgICB9XG4gICAgcmV0dXJuIERFRkFVTFRfTU9OVEhfTkFNRVNbc3R5bGVdO1xuICB9XG5cbiAgZ2V0RGF0ZU5hbWVzKCk6IHN0cmluZ1tdIHtcbiAgICBpZiAoU1VQUE9SVFNfSU5UTF9BUEkpIHtcbiAgICAgIGNvbnN0IGR0ZiA9IG5ldyBJbnRsLkRhdGVUaW1lRm9ybWF0KHRoaXMubG9jYWxlLCB7ZGF5OiAnbnVtZXJpYycsIHRpbWVab25lOiAndXRjJ30pO1xuICAgICAgcmV0dXJuIHJhbmdlKDMxLCBpID0+IHRoaXMuX3N0cmlwRGlyZWN0aW9uYWxpdHlDaGFyYWN0ZXJzKFxuICAgICAgICAgIHRoaXMuX2Zvcm1hdChkdGYsIG5ldyBEYXRlKDIwMTcsIDAsIGkgKyAxKSkpKTtcbiAgICB9XG4gICAgcmV0dXJuIERFRkFVTFRfREFURV9OQU1FUztcbiAgfVxuXG4gIGdldERheU9mV2Vla05hbWVzKHN0eWxlOiAnbG9uZycgfCAnc2hvcnQnIHwgJ25hcnJvdycpOiBzdHJpbmdbXSB7XG4gICAgaWYgKFNVUFBPUlRTX0lOVExfQVBJKSB7XG4gICAgICBjb25zdCBkdGYgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCh0aGlzLmxvY2FsZSwge3dlZWtkYXk6IHN0eWxlLCB0aW1lWm9uZTogJ3V0Yyd9KTtcbiAgICAgIHJldHVybiByYW5nZSg3LCBpID0+IHRoaXMuX3N0cmlwRGlyZWN0aW9uYWxpdHlDaGFyYWN0ZXJzKFxuICAgICAgICAgIHRoaXMuX2Zvcm1hdChkdGYsIG5ldyBEYXRlKDIwMTcsIDAsIGkgKyAxKSkpKTtcbiAgICB9XG4gICAgcmV0dXJuIERFRkFVTFRfREFZX09GX1dFRUtfTkFNRVNbc3R5bGVdO1xuICB9XG5cbiAgZ2V0WWVhck5hbWUoZGF0ZTogRGF0ZSk6IHN0cmluZyB7XG4gICAgaWYgKFNVUFBPUlRTX0lOVExfQVBJKSB7XG4gICAgICBjb25zdCBkdGYgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCh0aGlzLmxvY2FsZSwge3llYXI6ICdudW1lcmljJywgdGltZVpvbmU6ICd1dGMnfSk7XG4gICAgICByZXR1cm4gdGhpcy5fc3RyaXBEaXJlY3Rpb25hbGl0eUNoYXJhY3RlcnModGhpcy5fZm9ybWF0KGR0ZiwgZGF0ZSkpO1xuICAgIH1cbiAgICByZXR1cm4gU3RyaW5nKHRoaXMuZ2V0WWVhcihkYXRlKSk7XG4gIH1cblxuICBnZXRGaXJzdERheU9mV2VlaygpOiBudW1iZXIge1xuICAgIC8vIFdlIGNhbid0IHRlbGwgdXNpbmcgbmF0aXZlIEpTIERhdGUgd2hhdCB0aGUgZmlyc3QgZGF5IG9mIHRoZSB3ZWVrIGlzLCB3ZSBkZWZhdWx0IHRvIFN1bmRheS5cbiAgICByZXR1cm4gMDtcbiAgfVxuXG4gIGdldE51bURheXNJbk1vbnRoKGRhdGU6IERhdGUpOiBudW1iZXIge1xuICAgIHJldHVybiB0aGlzLmdldERhdGUodGhpcy5fY3JlYXRlRGF0ZVdpdGhPdmVyZmxvdyhcbiAgICAgICAgdGhpcy5nZXRZZWFyKGRhdGUpLCB0aGlzLmdldE1vbnRoKGRhdGUpICsgMSwgMCkpO1xuICB9XG5cbiAgY2xvbmUoZGF0ZTogRGF0ZSk6IERhdGUge1xuICAgIHJldHVybiBuZXcgRGF0ZShkYXRlLmdldFRpbWUoKSk7XG4gIH1cblxuICBjcmVhdGVEYXRlKHllYXI6IG51bWJlciwgbW9udGg6IG51bWJlciwgZGF0ZTogbnVtYmVyKTogRGF0ZSB7XG4gICAgLy8gQ2hlY2sgZm9yIGludmFsaWQgbW9udGggYW5kIGRhdGUgKGV4Y2VwdCB1cHBlciBib3VuZCBvbiBkYXRlIHdoaWNoIHdlIGhhdmUgdG8gY2hlY2sgYWZ0ZXJcbiAgICAvLyBjcmVhdGluZyB0aGUgRGF0ZSkuXG4gICAgaWYgKG1vbnRoIDwgMCB8fCBtb250aCA+IDExKSB7XG4gICAgICB0aHJvdyBFcnJvcihgSW52YWxpZCBtb250aCBpbmRleCBcIiR7bW9udGh9XCIuIE1vbnRoIGluZGV4IGhhcyB0byBiZSBiZXR3ZWVuIDAgYW5kIDExLmApO1xuICAgIH1cblxuICAgIGlmIChkYXRlIDwgMSkge1xuICAgICAgdGhyb3cgRXJyb3IoYEludmFsaWQgZGF0ZSBcIiR7ZGF0ZX1cIi4gRGF0ZSBoYXMgdG8gYmUgZ3JlYXRlciB0aGFuIDAuYCk7XG4gICAgfVxuXG4gICAgbGV0IHJlc3VsdCA9IHRoaXMuX2NyZWF0ZURhdGVXaXRoT3ZlcmZsb3coeWVhciwgbW9udGgsIGRhdGUpO1xuICAgIC8vIENoZWNrIHRoYXQgdGhlIGRhdGUgd2Fzbid0IGFib3ZlIHRoZSB1cHBlciBib3VuZCBmb3IgdGhlIG1vbnRoLCBjYXVzaW5nIHRoZSBtb250aCB0byBvdmVyZmxvd1xuICAgIGlmIChyZXN1bHQuZ2V0TW9udGgoKSAhPSBtb250aCkge1xuICAgICAgdGhyb3cgRXJyb3IoYEludmFsaWQgZGF0ZSBcIiR7ZGF0ZX1cIiBmb3IgbW9udGggd2l0aCBpbmRleCBcIiR7bW9udGh9XCIuYCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIHRvZGF5KCk6IERhdGUge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpO1xuICB9XG5cbiAgcGFyc2UodmFsdWU6IGFueSk6IERhdGUgfCBudWxsIHtcbiAgICAvLyBXZSBoYXZlIG5vIHdheSB1c2luZyB0aGUgbmF0aXZlIEpTIERhdGUgdG8gc2V0IHRoZSBwYXJzZSBmb3JtYXQgb3IgbG9jYWxlLCBzbyB3ZSBpZ25vcmUgdGhlc2VcbiAgICAvLyBwYXJhbWV0ZXJzLlxuICAgIGlmICh0eXBlb2YgdmFsdWUgPT0gJ251bWJlcicpIHtcbiAgICAgIHJldHVybiBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZSA/IG5ldyBEYXRlKERhdGUucGFyc2UodmFsdWUpKSA6IG51bGw7XG4gIH1cblxuICBmb3JtYXQoZGF0ZTogRGF0ZSwgZGlzcGxheUZvcm1hdDogT2JqZWN0KTogc3RyaW5nIHtcbiAgICBpZiAoIXRoaXMuaXNWYWxpZChkYXRlKSkge1xuICAgICAgdGhyb3cgRXJyb3IoJ05hdGl2ZURhdGVBZGFwdGVyOiBDYW5ub3QgZm9ybWF0IGludmFsaWQgZGF0ZS4nKTtcbiAgICB9XG5cbiAgICBpZiAoU1VQUE9SVFNfSU5UTF9BUEkpIHtcbiAgICAgIC8vIE9uIElFIGFuZCBFZGdlIHRoZSBpMThuIEFQSSB3aWxsIHRocm93IGEgaGFyZCBlcnJvciB0aGF0IGNhbiBjcmFzaCB0aGUgZW50aXJlIGFwcFxuICAgICAgLy8gaWYgd2UgYXR0ZW1wdCB0byBmb3JtYXQgYSBkYXRlIHdob3NlIHllYXIgaXMgbGVzcyB0aGFuIDEgb3IgZ3JlYXRlciB0aGFuIDk5OTkuXG4gICAgICBpZiAodGhpcy5fY2xhbXBEYXRlICYmIChkYXRlLmdldEZ1bGxZZWFyKCkgPCAxIHx8IGRhdGUuZ2V0RnVsbFllYXIoKSA+IDk5OTkpKSB7XG4gICAgICAgIGRhdGUgPSB0aGlzLmNsb25lKGRhdGUpO1xuICAgICAgICBkYXRlLnNldEZ1bGxZZWFyKE1hdGgubWF4KDEsIE1hdGgubWluKDk5OTksIGRhdGUuZ2V0RnVsbFllYXIoKSkpKTtcbiAgICAgIH1cblxuICAgICAgZGlzcGxheUZvcm1hdCA9IHsuLi5kaXNwbGF5Rm9ybWF0LCB0aW1lWm9uZTogJ3V0Yyd9O1xuXG4gICAgICBjb25zdCBkdGYgPSBuZXcgSW50bC5EYXRlVGltZUZvcm1hdCh0aGlzLmxvY2FsZSwgZGlzcGxheUZvcm1hdCk7XG4gICAgICByZXR1cm4gdGhpcy5fc3RyaXBEaXJlY3Rpb25hbGl0eUNoYXJhY3RlcnModGhpcy5fZm9ybWF0KGR0ZiwgZGF0ZSkpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5fc3RyaXBEaXJlY3Rpb25hbGl0eUNoYXJhY3RlcnMoZGF0ZS50b0RhdGVTdHJpbmcoKSk7XG4gIH1cblxuICBhZGRDYWxlbmRhclllYXJzKGRhdGU6IERhdGUsIHllYXJzOiBudW1iZXIpOiBEYXRlIHtcbiAgICByZXR1cm4gdGhpcy5hZGRDYWxlbmRhck1vbnRocyhkYXRlLCB5ZWFycyAqIDEyKTtcbiAgfVxuXG4gIGFkZENhbGVuZGFyTW9udGhzKGRhdGU6IERhdGUsIG1vbnRoczogbnVtYmVyKTogRGF0ZSB7XG4gICAgbGV0IG5ld0RhdGUgPSB0aGlzLl9jcmVhdGVEYXRlV2l0aE92ZXJmbG93KFxuICAgICAgICB0aGlzLmdldFllYXIoZGF0ZSksIHRoaXMuZ2V0TW9udGgoZGF0ZSkgKyBtb250aHMsIHRoaXMuZ2V0RGF0ZShkYXRlKSk7XG5cbiAgICAvLyBJdCdzIHBvc3NpYmxlIHRvIHdpbmQgdXAgaW4gdGhlIHdyb25nIG1vbnRoIGlmIHRoZSBvcmlnaW5hbCBtb250aCBoYXMgbW9yZSBkYXlzIHRoYW4gdGhlIG5ld1xuICAgIC8vIG1vbnRoLiBJbiB0aGlzIGNhc2Ugd2Ugd2FudCB0byBnbyB0byB0aGUgbGFzdCBkYXkgb2YgdGhlIGRlc2lyZWQgbW9udGguXG4gICAgLy8gTm90ZTogdGhlIGFkZGl0aW9uYWwgKyAxMiAlIDEyIGVuc3VyZXMgd2UgZW5kIHVwIHdpdGggYSBwb3NpdGl2ZSBudW1iZXIsIHNpbmNlIEpTICUgZG9lc24ndFxuICAgIC8vIGd1YXJhbnRlZSB0aGlzLlxuICAgIGlmICh0aGlzLmdldE1vbnRoKG5ld0RhdGUpICE9ICgodGhpcy5nZXRNb250aChkYXRlKSArIG1vbnRocykgJSAxMiArIDEyKSAlIDEyKSB7XG4gICAgICBuZXdEYXRlID0gdGhpcy5fY3JlYXRlRGF0ZVdpdGhPdmVyZmxvdyh0aGlzLmdldFllYXIobmV3RGF0ZSksIHRoaXMuZ2V0TW9udGgobmV3RGF0ZSksIDApO1xuICAgIH1cblxuICAgIHJldHVybiBuZXdEYXRlO1xuICB9XG5cbiAgYWRkQ2FsZW5kYXJEYXlzKGRhdGU6IERhdGUsIGRheXM6IG51bWJlcik6IERhdGUge1xuICAgIHJldHVybiB0aGlzLl9jcmVhdGVEYXRlV2l0aE92ZXJmbG93KFxuICAgICAgICB0aGlzLmdldFllYXIoZGF0ZSksIHRoaXMuZ2V0TW9udGgoZGF0ZSksIHRoaXMuZ2V0RGF0ZShkYXRlKSArIGRheXMpO1xuICB9XG5cbiAgdG9Jc284NjAxKGRhdGU6IERhdGUpOiBzdHJpbmcge1xuICAgIHJldHVybiBbXG4gICAgICBkYXRlLmdldFVUQ0Z1bGxZZWFyKCksXG4gICAgICB0aGlzLl8yZGlnaXQoZGF0ZS5nZXRVVENNb250aCgpICsgMSksXG4gICAgICB0aGlzLl8yZGlnaXQoZGF0ZS5nZXRVVENEYXRlKCkpXG4gICAgXS5qb2luKCctJyk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyB0aGUgZ2l2ZW4gdmFsdWUgaWYgZ2l2ZW4gYSB2YWxpZCBEYXRlIG9yIG51bGwuIERlc2VyaWFsaXplcyB2YWxpZCBJU08gODYwMSBzdHJpbmdzXG4gICAqIChodHRwczovL3d3dy5pZXRmLm9yZy9yZmMvcmZjMzMzOS50eHQpIGludG8gdmFsaWQgRGF0ZXMgYW5kIGVtcHR5IHN0cmluZyBpbnRvIG51bGwuIFJldHVybnMgYW5cbiAgICogaW52YWxpZCBkYXRlIGZvciBhbGwgb3RoZXIgdmFsdWVzLlxuICAgKi9cbiAgZGVzZXJpYWxpemUodmFsdWU6IGFueSk6IERhdGUgfCBudWxsIHtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKCF2YWx1ZSkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cbiAgICAgIC8vIFRoZSBgRGF0ZWAgY29uc3RydWN0b3IgYWNjZXB0cyBmb3JtYXRzIG90aGVyIHRoYW4gSVNPIDg2MDEsIHNvIHdlIG5lZWQgdG8gbWFrZSBzdXJlIHRoZVxuICAgICAgLy8gc3RyaW5nIGlzIHRoZSByaWdodCBmb3JtYXQgZmlyc3QuXG4gICAgICBpZiAoSVNPXzg2MDFfUkVHRVgudGVzdCh2YWx1ZSkpIHtcbiAgICAgICAgbGV0IGRhdGUgPSBuZXcgRGF0ZSh2YWx1ZSk7XG4gICAgICAgIGlmICh0aGlzLmlzVmFsaWQoZGF0ZSkpIHtcbiAgICAgICAgICByZXR1cm4gZGF0ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gc3VwZXIuZGVzZXJpYWxpemUodmFsdWUpO1xuICB9XG5cbiAgaXNEYXRlSW5zdGFuY2Uob2JqOiBhbnkpIHtcbiAgICByZXR1cm4gb2JqIGluc3RhbmNlb2YgRGF0ZTtcbiAgfVxuXG4gIGlzVmFsaWQoZGF0ZTogRGF0ZSkge1xuICAgIHJldHVybiAhaXNOYU4oZGF0ZS5nZXRUaW1lKCkpO1xuICB9XG5cbiAgaW52YWxpZCgpOiBEYXRlIHtcbiAgICByZXR1cm4gbmV3IERhdGUoTmFOKTtcbiAgfVxuXG4gIC8qKiBDcmVhdGVzIGEgZGF0ZSBidXQgYWxsb3dzIHRoZSBtb250aCBhbmQgZGF0ZSB0byBvdmVyZmxvdy4gKi9cbiAgcHJpdmF0ZSBfY3JlYXRlRGF0ZVdpdGhPdmVyZmxvdyh5ZWFyOiBudW1iZXIsIG1vbnRoOiBudW1iZXIsIGRhdGU6IG51bWJlcikge1xuICAgIGNvbnN0IHJlc3VsdCA9IG5ldyBEYXRlKHllYXIsIG1vbnRoLCBkYXRlKTtcblxuICAgIC8vIFdlIG5lZWQgdG8gY29ycmVjdCBmb3IgdGhlIGZhY3QgdGhhdCBKUyBuYXRpdmUgRGF0ZSB0cmVhdHMgeWVhcnMgaW4gcmFuZ2UgWzAsIDk5XSBhc1xuICAgIC8vIGFiYnJldmlhdGlvbnMgZm9yIDE5eHguXG4gICAgaWYgKHllYXIgPj0gMCAmJiB5ZWFyIDwgMTAwKSB7XG4gICAgICByZXN1bHQuc2V0RnVsbFllYXIodGhpcy5nZXRZZWFyKHJlc3VsdCkgLSAxOTAwKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfVxuXG4gIC8qKlxuICAgKiBQYWRzIGEgbnVtYmVyIHRvIG1ha2UgaXQgdHdvIGRpZ2l0cy5cbiAgICogQHBhcmFtIG4gVGhlIG51bWJlciB0byBwYWQuXG4gICAqIEByZXR1cm5zIFRoZSBwYWRkZWQgbnVtYmVyLlxuICAgKi9cbiAgcHJpdmF0ZSBfMmRpZ2l0KG46IG51bWJlcikge1xuICAgIHJldHVybiAoJzAwJyArIG4pLnNsaWNlKC0yKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdHJpcCBvdXQgdW5pY29kZSBMVFIgYW5kIFJUTCBjaGFyYWN0ZXJzLiBFZGdlIGFuZCBJRSBpbnNlcnQgdGhlc2UgaW50byBmb3JtYXR0ZWQgZGF0ZXMgd2hpbGVcbiAgICogb3RoZXIgYnJvd3NlcnMgZG8gbm90LiBXZSByZW1vdmUgdGhlbSB0byBtYWtlIG91dHB1dCBjb25zaXN0ZW50IGFuZCBiZWNhdXNlIHRoZXkgaW50ZXJmZXJlIHdpdGhcbiAgICogZGF0ZSBwYXJzaW5nLlxuICAgKiBAcGFyYW0gc3RyIFRoZSBzdHJpbmcgdG8gc3RyaXAgZGlyZWN0aW9uIGNoYXJhY3RlcnMgZnJvbS5cbiAgICogQHJldHVybnMgVGhlIHN0cmlwcGVkIHN0cmluZy5cbiAgICovXG4gIHByaXZhdGUgX3N0cmlwRGlyZWN0aW9uYWxpdHlDaGFyYWN0ZXJzKHN0cjogc3RyaW5nKSB7XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKC9bXFx1MjAwZVxcdTIwMGZdL2csICcnKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBXaGVuIGNvbnZlcnRpbmcgRGF0ZSBvYmplY3QgdG8gc3RyaW5nLCBqYXZhc2NyaXB0IGJ1aWx0LWluIGZ1bmN0aW9ucyBtYXkgcmV0dXJuIHdyb25nXG4gICAqIHJlc3VsdHMgYmVjYXVzZSBpdCBhcHBsaWVzIGl0cyBpbnRlcm5hbCBEU1QgcnVsZXMuIFRoZSBEU1QgcnVsZXMgYXJvdW5kIHRoZSB3b3JsZCBjaGFuZ2VcbiAgICogdmVyeSBmcmVxdWVudGx5LCBhbmQgdGhlIGN1cnJlbnQgdmFsaWQgcnVsZSBpcyBub3QgYWx3YXlzIHZhbGlkIGluIHByZXZpb3VzIHllYXJzIHRob3VnaC5cbiAgICogV2Ugd29yayBhcm91bmQgdGhpcyBwcm9ibGVtIGJ1aWxkaW5nIGEgbmV3IERhdGUgb2JqZWN0IHdoaWNoIGhhcyBpdHMgaW50ZXJuYWwgVVRDXG4gICAqIHJlcHJlc2VudGF0aW9uIHdpdGggdGhlIGxvY2FsIGRhdGUgYW5kIHRpbWUuXG4gICAqIEBwYXJhbSBkdGYgSW50bC5EYXRlVGltZUZvcm1hdCBvYmplY3QsIGNvbnRhaW5nIHRoZSBkZXNpcmVkIHN0cmluZyBmb3JtYXQuIEl0IG11c3QgaGF2ZVxuICAgKiAgICB0aW1lWm9uZSBzZXQgdG8gJ3V0YycgdG8gd29yayBmaW5lLlxuICAgKiBAcGFyYW0gZGF0ZSBEYXRlIGZyb20gd2hpY2ggd2Ugd2FudCB0byBnZXQgdGhlIHN0cmluZyByZXByZXNlbnRhdGlvbiBhY2NvcmRpbmcgdG8gZHRmXG4gICAqIEByZXR1cm5zIEEgRGF0ZSBvYmplY3Qgd2l0aCBpdHMgVVRDIHJlcHJlc2VudGF0aW9uIGJhc2VkIG9uIHRoZSBwYXNzZWQgaW4gZGF0ZSBpbmZvXG4gICAqL1xuICBwcml2YXRlIF9mb3JtYXQoZHRmOiBJbnRsLkRhdGVUaW1lRm9ybWF0LCBkYXRlOiBEYXRlKSB7XG4gICAgY29uc3QgZCA9IG5ldyBEYXRlKERhdGUuVVRDKFxuICAgICAgICBkYXRlLmdldEZ1bGxZZWFyKCksIGRhdGUuZ2V0TW9udGgoKSwgZGF0ZS5nZXREYXRlKCksIGRhdGUuZ2V0SG91cnMoKSxcbiAgICAgICAgZGF0ZS5nZXRNaW51dGVzKCksIGRhdGUuZ2V0U2Vjb25kcygpLCBkYXRlLmdldE1pbGxpc2Vjb25kcygpKSk7XG4gICAgcmV0dXJuIGR0Zi5mb3JtYXQoZCk7XG4gIH1cbn1cbiJdfQ==