/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { _isNumberValue } from '@angular/cdk/coercion';
import { DataSource } from '@angular/cdk/table';
import { BehaviorSubject, combineLatest, merge, of as observableOf, Subject, Subscription, } from 'rxjs';
import { map } from 'rxjs/operators';
/**
 * Corresponds to `Number.MAX_SAFE_INTEGER`. Moved out into a variable here due to
 * flaky browser support and the value not being defined in Closure's typings.
 */
const MAX_SAFE_INTEGER = 9007199254740991;
/** Shared base class with MDC-based implementation. */
export class _MatTableDataSource extends DataSource {
    constructor(initialData = []) {
        super();
        /** Stream emitting render data to the table (depends on ordered data changes). */
        this._renderData = new BehaviorSubject([]);
        /** Stream that emits when a new filter string is set on the data source. */
        this._filter = new BehaviorSubject('');
        /** Used to react to internal changes of the paginator that are made by the data source itself. */
        this._internalPageChanges = new Subject();
        /**
         * Subscription to the changes that should trigger an update to the table's rendered rows, such
         * as filtering, sorting, pagination, or base data changes.
         */
        this._renderChangesSubscription = Subscription.EMPTY;
        /**
         * Data accessor function that is used for accessing data properties for sorting through
         * the default sortData function.
         * This default function assumes that the sort header IDs (which defaults to the column name)
         * matches the data's properties (e.g. column Xyz represents data['Xyz']).
         * May be set to a custom function for different behavior.
         * @param data Data object that is being accessed.
         * @param sortHeaderId The name of the column that represents the data.
         */
        this.sortingDataAccessor = (data, sortHeaderId) => {
            const value = data[sortHeaderId];
            if (_isNumberValue(value)) {
                const numberValue = Number(value);
                // Numbers beyond `MAX_SAFE_INTEGER` can't be compared reliably so we
                // leave them as strings. For more info: https://goo.gl/y5vbSg
                return numberValue < MAX_SAFE_INTEGER ? numberValue : value;
            }
            return value;
        };
        /**
         * Gets a sorted copy of the data array based on the state of the MatSort. Called
         * after changes are made to the filtered data or when sort changes are emitted from MatSort.
         * By default, the function retrieves the active sort and its direction and compares data
         * by retrieving data using the sortingDataAccessor. May be overridden for a custom implementation
         * of data ordering.
         * @param data The array of data that should be sorted.
         * @param sort The connected MatSort that holds the current sort state.
         */
        this.sortData = (data, sort) => {
            const active = sort.active;
            const direction = sort.direction;
            if (!active || direction == '') {
                return data;
            }
            return data.sort((a, b) => {
                let valueA = this.sortingDataAccessor(a, active);
                let valueB = this.sortingDataAccessor(b, active);
                // If there are data in the column that can be converted to a number,
                // it must be ensured that the rest of the data
                // is of the same type so as not to order incorrectly.
                const valueAType = typeof valueA;
                const valueBType = typeof valueB;
                if (valueAType !== valueBType) {
                    if (valueAType === 'number') {
                        valueA += '';
                    }
                    if (valueBType === 'number') {
                        valueB += '';
                    }
                }
                // If both valueA and valueB exist (truthy), then compare the two. Otherwise, check if
                // one value exists while the other doesn't. In this case, existing value should come last.
                // This avoids inconsistent results when comparing values to undefined/null.
                // If neither value exists, return 0 (equal).
                let comparatorResult = 0;
                if (valueA != null && valueB != null) {
                    // Check if one value is greater than the other; if equal, comparatorResult should remain 0.
                    if (valueA > valueB) {
                        comparatorResult = 1;
                    }
                    else if (valueA < valueB) {
                        comparatorResult = -1;
                    }
                }
                else if (valueA != null) {
                    comparatorResult = 1;
                }
                else if (valueB != null) {
                    comparatorResult = -1;
                }
                return comparatorResult * (direction == 'asc' ? 1 : -1);
            });
        };
        /**
         * Checks if a data object matches the data source's filter string. By default, each data object
         * is converted to a string of its properties and returns true if the filter has
         * at least one occurrence in that string. By default, the filter string has its whitespace
         * trimmed and the match is case-insensitive. May be overridden for a custom implementation of
         * filter matching.
         * @param data Data object used to check against the filter.
         * @param filter Filter string that has been set on the data source.
         * @returns Whether the filter matches against the data
         */
        this.filterPredicate = (data, filter) => {
            // Transform the data into a lowercase string of all property values.
            const dataStr = Object.keys(data).reduce((currentTerm, key) => {
                // Use an obscure Unicode character to delimit the words in the concatenated string.
                // This avoids matches where the values of two columns combined will match the user's query
                // (e.g. `Flute` and `Stop` will match `Test`). The character is intended to be something
                // that has a very low chance of being typed in by somebody in a text field. This one in
                // particular is "White up-pointing triangle with dot" from
                // https://en.wikipedia.org/wiki/List_of_Unicode_characters
                return currentTerm + data[key] + '◬';
            }, '').toLowerCase();
            // Transform the filter by converting it to lowercase and removing whitespace.
            const transformedFilter = filter.trim().toLowerCase();
            return dataStr.indexOf(transformedFilter) != -1;
        };
        this._data = new BehaviorSubject(initialData);
        this._updateChangeSubscription();
    }
    /** Array of data that should be rendered by the table, where each object represents one row. */
    get data() { return this._data.value; }
    set data(data) { this._data.next(data); }
    /**
     * Filter term that should be used to filter out objects from the data array. To override how
     * data objects match to this filter string, provide a custom function for filterPredicate.
     */
    get filter() { return this._filter.value; }
    set filter(filter) { this._filter.next(filter); }
    /**
     * Instance of the MatSort directive used by the table to control its sorting. Sort changes
     * emitted by the MatSort will trigger an update to the table's rendered data.
     */
    get sort() { return this._sort; }
    set sort(sort) {
        this._sort = sort;
        this._updateChangeSubscription();
    }
    /**
     * Instance of the MatPaginator component used by the table to control what page of the data is
     * displayed. Page changes emitted by the MatPaginator will trigger an update to the
     * table's rendered data.
     *
     * Note that the data source uses the paginator's properties to calculate which page of data
     * should be displayed. If the paginator receives its properties as template inputs,
     * e.g. `[pageLength]=100` or `[pageIndex]=1`, then be sure that the paginator's view has been
     * initialized before assigning it to this data source.
     */
    get paginator() { return this._paginator; }
    set paginator(paginator) {
        this._paginator = paginator;
        this._updateChangeSubscription();
    }
    /**
     * Subscribe to changes that should trigger an update to the table's rendered rows. When the
     * changes occur, process the current state of the filter, sort, and pagination along with
     * the provided base data and send it to the table for rendering.
     */
    _updateChangeSubscription() {
        // Sorting and/or pagination should be watched if MatSort and/or MatPaginator are provided.
        // The events should emit whenever the component emits a change or initializes, or if no
        // component is provided, a stream with just a null event should be provided.
        // The `sortChange` and `pageChange` acts as a signal to the combineLatests below so that the
        // pipeline can progress to the next step. Note that the value from these streams are not used,
        // they purely act as a signal to progress in the pipeline.
        const sortChange = this._sort ?
            merge(this._sort.sortChange, this._sort.initialized) :
            observableOf(null);
        const pageChange = this._paginator ?
            merge(this._paginator.page, this._internalPageChanges, this._paginator.initialized) :
            observableOf(null);
        const dataStream = this._data;
        // Watch for base data or filter changes to provide a filtered set of data.
        const filteredData = combineLatest([dataStream, this._filter])
            .pipe(map(([data]) => this._filterData(data)));
        // Watch for filtered data or sort changes to provide an ordered set of data.
        const orderedData = combineLatest([filteredData, sortChange])
            .pipe(map(([data]) => this._orderData(data)));
        // Watch for ordered data or page changes to provide a paged set of data.
        const paginatedData = combineLatest([orderedData, pageChange])
            .pipe(map(([data]) => this._pageData(data)));
        // Watched for paged data changes and send the result to the table to render.
        this._renderChangesSubscription.unsubscribe();
        this._renderChangesSubscription = paginatedData.subscribe(data => this._renderData.next(data));
    }
    /**
     * Returns a filtered data array where each filter object contains the filter string within
     * the result of the filterTermAccessor function. If no filter is set, returns the data array
     * as provided.
     */
    _filterData(data) {
        // If there is a filter string, filter out data that does not contain it.
        // Each data object is converted to a string using the function defined by filterTermAccessor.
        // May be overridden for customization.
        this.filteredData = (this.filter == null || this.filter === '') ? data :
            data.filter(obj => this.filterPredicate(obj, this.filter));
        if (this.paginator) {
            this._updatePaginator(this.filteredData.length);
        }
        return this.filteredData;
    }
    /**
     * Returns a sorted copy of the data if MatSort has a sort applied, otherwise just returns the
     * data array as provided. Uses the default data accessor for data lookup, unless a
     * sortDataAccessor function is defined.
     */
    _orderData(data) {
        // If there is no active sort or direction, return the data without trying to sort.
        if (!this.sort) {
            return data;
        }
        return this.sortData(data.slice(), this.sort);
    }
    /**
     * Returns a paged slice of the provided data array according to the provided MatPaginator's page
     * index and length. If there is no paginator provided, returns the data array as provided.
     */
    _pageData(data) {
        if (!this.paginator) {
            return data;
        }
        const startIndex = this.paginator.pageIndex * this.paginator.pageSize;
        return data.slice(startIndex, startIndex + this.paginator.pageSize);
    }
    /**
     * Updates the paginator to reflect the length of the filtered data, and makes sure that the page
     * index does not exceed the paginator's last page. Values are changed in a resolved promise to
     * guard against making property changes within a round of change detection.
     */
    _updatePaginator(filteredDataLength) {
        Promise.resolve().then(() => {
            const paginator = this.paginator;
            if (!paginator) {
                return;
            }
            paginator.length = filteredDataLength;
            // If the page index is set beyond the page, reduce it to the last page.
            if (paginator.pageIndex > 0) {
                const lastPageIndex = Math.ceil(paginator.length / paginator.pageSize) - 1 || 0;
                const newPageIndex = Math.min(paginator.pageIndex, lastPageIndex);
                if (newPageIndex !== paginator.pageIndex) {
                    paginator.pageIndex = newPageIndex;
                    // Since the paginator only emits after user-generated changes,
                    // we need our own stream so we know to should re-render the data.
                    this._internalPageChanges.next();
                }
            }
        });
    }
    /**
     * Used by the MatTable. Called when it connects to the data source.
     * @docs-private
     */
    connect() { return this._renderData; }
    /**
     * Used by the MatTable. Called when it is destroyed. No-op.
     * @docs-private
     */
    disconnect() { }
}
/**
 * Data source that accepts a client-side data array and includes native support of filtering,
 * sorting (using MatSort), and pagination (using MatPaginator).
 *
 * Allows for sort customization by overriding sortingDataAccessor, which defines how data
 * properties are accessed. Also allows for filter customization by overriding filterTermAccessor,
 * which defines how row data is converted to a string for filter matching.
 *
 * **Note:** This class is meant to be a simple data source to help you get started. As such
 * it isn't equipped to handle some more advanced cases like robust i18n support or server-side
 * interactions. If your app needs to support more advanced use cases, consider implementing your
 * own `DataSource`.
 */
export class MatTableDataSource extends _MatTableDataSource {
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUtZGF0YS1zb3VyY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi8uLi8uLi8uLi9zcmMvbWF0ZXJpYWwvdGFibGUvdGFibGUtZGF0YS1zb3VyY2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztHQU1HO0FBRUgsT0FBTyxFQUFDLGNBQWMsRUFBQyxNQUFNLHVCQUF1QixDQUFDO0FBQ3JELE9BQU8sRUFBQyxVQUFVLEVBQUMsTUFBTSxvQkFBb0IsQ0FBQztBQUc5QyxPQUFPLEVBQ0wsZUFBZSxFQUNmLGFBQWEsRUFDYixLQUFLLEVBRUwsRUFBRSxJQUFJLFlBQVksRUFDbEIsT0FBTyxFQUNQLFlBQVksR0FDYixNQUFNLE1BQU0sQ0FBQztBQUNkLE9BQU8sRUFBQyxHQUFHLEVBQUMsTUFBTSxnQkFBZ0IsQ0FBQztBQUVuQzs7O0dBR0c7QUFDSCxNQUFNLGdCQUFnQixHQUFHLGdCQUFnQixDQUFDO0FBVTFDLHVEQUF1RDtBQUN2RCxNQUFNLE9BQU8sbUJBQTRDLFNBQVEsVUFBYTtJQXlLNUUsWUFBWSxjQUFtQixFQUFFO1FBQy9CLEtBQUssRUFBRSxDQUFDO1FBdEtWLGtGQUFrRjtRQUNqRSxnQkFBVyxHQUFHLElBQUksZUFBZSxDQUFNLEVBQUUsQ0FBQyxDQUFDO1FBRTVELDRFQUE0RTtRQUMzRCxZQUFPLEdBQUcsSUFBSSxlQUFlLENBQVMsRUFBRSxDQUFDLENBQUM7UUFFM0Qsa0dBQWtHO1FBQ2pGLHlCQUFvQixHQUFHLElBQUksT0FBTyxFQUFRLENBQUM7UUFFNUQ7OztXQUdHO1FBQ0gsK0JBQTBCLEdBQUcsWUFBWSxDQUFDLEtBQUssQ0FBQztRQWlEaEQ7Ozs7Ozs7O1dBUUc7UUFDSCx3QkFBbUIsR0FDZixDQUFDLElBQU8sRUFBRSxZQUFvQixFQUFpQixFQUFFO1lBQ25ELE1BQU0sS0FBSyxHQUFJLElBQTZCLENBQUMsWUFBWSxDQUFDLENBQUM7WUFFM0QsSUFBSSxjQUFjLENBQUMsS0FBSyxDQUFD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RTtvQkFDeEMsU0FBUyxDQUFDLFNBQVMsR0FBRyxZQUFZLENBQUM7b0JBRW5DLCtEQUErRDtvQkFDL0Qsa0VBQWtFO29CQUNsRSxJQUFJLENBQUMsb0JBQW9CLENBQUMsSUFBSSxFQUFFLENBQUM7aUJBQ2xDO2FBQ0Y7UUFDSCxDQUFDLENBQUMsQ0FBQztJQUNMLENBQUM7SUFFRDs7O09BR0c7SUFDSCxPQUFPLEtBQUssT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztJQUV0Qzs7O09BR0c7SUFDSCxVQUFVLEtBQUssQ0FBQztDQUNqQjtBQUVEOzs7Ozs7Ozs7Ozs7R0FZRztBQUNILE1BQU0sT0FBTyxrQkFBc0IsU0FBUSxtQkFBb0M7Q0FBRyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge19pc051bWJlclZhbHVlfSBmcm9tICdAYW5ndWxhci9jZGsvY29lcmNpb24nO1xuaW1wb3J0IHtEYXRhU291cmNlfSBmcm9tICdAYW5ndWxhci9jZGsvdGFibGUnO1xuaW1wb3J0IHtNYXRQYWdpbmF0b3IsIFBhZ2VFdmVudH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvcGFnaW5hdG9yJztcbmltcG9ydCB7TWF0U29ydCwgU29ydH0gZnJvbSAnQGFuZ3VsYXIvbWF0ZXJpYWwvc29ydCc7XG5pbXBvcnQge1xuICBCZWhhdmlvclN1YmplY3QsXG4gIGNvbWJpbmVMYXRlc3QsXG4gIG1lcmdlLFxuICBPYnNlcnZhYmxlLFxuICBvZiBhcyBvYnNlcnZhYmxlT2YsXG4gIFN1YmplY3QsXG4gIFN1YnNjcmlwdGlvbixcbn0gZnJvbSAncnhqcyc7XG5pbXBvcnQge21hcH0gZnJvbSAncnhqcy9vcGVyYXRvcnMnO1xuXG4vKipcbiAqIENvcnJlc3BvbmRzIHRvIGBOdW1iZXIuTUFYX1NBRkVfSU5URUdFUmAuIE1vdmVkIG91dCBpbnRvIGEgdmFyaWFibGUgaGVyZSBkdWUgdG9cbiAqIGZsYWt5IGJyb3dzZXIgc3VwcG9ydCBhbmQgdGhlIHZhbHVlIG5vdCBiZWluZyBkZWZpbmVkIGluIENsb3N1cmUncyB0eXBpbmdzLlxuICovXG5jb25zdCBNQVhfU0FGRV9JTlRFR0VSID0gOTAwNzE5OTI1NDc0MDk5MTtcblxuaW50ZXJmYWNlIFBhZ2luYXRvciB7XG4gIHBhZ2U6IFN1YmplY3Q8UGFnZUV2ZW50PjtcbiAgcGFnZUluZGV4OiBudW1iZXI7XG4gIGluaXRpYWxpemVkOiBPYnNlcnZhYmxlPHZvaWQ+O1xuICBwYWdlU2l6ZTogbnVtYmVyO1xuICBsZW5ndGg6IG51bWJlcjtcbn1cblxuLyoqIFNoYXJlZCBiYXNlIGNsYXNzIHdpdGggTURDLWJhc2VkIGltcGxlbWVudGF0aW9uLiAqL1xuZXhwb3J0IGNsYXNzIF9NYXRUYWJsZURhdGFTb3VyY2U8VCwgUCBleHRlbmRzIFBhZ2luYXRvcj4gZXh0ZW5kcyBEYXRhU291cmNlPFQ+IHtcbiAgLyoqIFN0cmVhbSB0aGF0IGVtaXRzIHdoZW4gYSBuZXcgZGF0YSBhcnJheSBpcyBzZXQgb24gdGhlIGRhdGEgc291cmNlLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9kYXRhOiBCZWhhdmlvclN1YmplY3Q8VFtdPjtcblxuICAvKiogU3RyZWFtIGVtaXR0aW5nIHJlbmRlciBkYXRhIHRvIHRoZSB0YWJsZSAoZGVwZW5kcyBvbiBvcmRlcmVkIGRhdGEgY2hhbmdlcykuICovXG4gIHByaXZhdGUgcmVhZG9ubHkgX3JlbmRlckRhdGEgPSBuZXcgQmVoYXZpb3JTdWJqZWN0PFRbXT4oW10pO1xuXG4gIC8qKiBTdHJlYW0gdGhhdCBlbWl0cyB3aGVuIGEgbmV3IGZpbHRlciBzdHJpbmcgaXMgc2V0IG9uIHRoZSBkYXRhIHNvdXJjZS4gKi9cbiAgcHJpdmF0ZSByZWFkb25seSBfZmlsdGVyID0gbmV3IEJlaGF2aW9yU3ViamVjdDxzdHJpbmc+KCcnKTtcblxuICAvKiogVXNlZCB0byByZWFjdCB0byBpbnRlcm5hbCBjaGFuZ2VzIG9mIHRoZSBwYWdpbmF0b3IgdGhhdCBhcmUgbWFkZSBieSB0aGUgZGF0YSBzb3VyY2UgaXRzZWxmLiAqL1xuICBwcml2YXRlIHJlYWRvbmx5IF9pbnRlcm5hbFBhZ2VDaGFuZ2VzID0gbmV3IFN1YmplY3Q8dm9pZD4oKTtcblxuICAvKipcbiAgICogU3Vic2NyaXB0aW9uIHRvIHRoZSBjaGFuZ2VzIHRoYXQgc2hvdWxkIHRyaWdnZXIgYW4gdXBkYXRlIHRvIHRoZSB0YWJsZSdzIHJlbmRlcmVkIHJvd3MsIHN1Y2hcbiAgICogYXMgZmlsdGVyaW5nLCBzb3J0aW5nLCBwYWdpbmF0aW9uLCBvciBiYXNlIGRhdGEgY2hhbmdlcy5cbiAgICovXG4gIF9yZW5kZXJDaGFuZ2VzU3Vic2NyaXB0aW9uID0gU3Vic2NyaXB0aW9uLkVNUFRZO1xuXG4gIC8qKlxuICAgKiBUaGUgZmlsdGVyZWQgc2V0IG9mIGRhdGEgdGhhdCBoYXMgYmVlbiBtYXRjaGVkIGJ5IHRoZSBmaWx0ZXIgc3RyaW5nLCBvciBhbGwgdGhlIGRhdGEgaWYgdGhlcmVcbiAgICogaXMgbm8gZmlsdGVyLiBVc2VmdWwgZm9yIGtub3dpbmcgdGhlIHNldCBvZiBkYXRhIHRoZSB0YWJsZSByZXByZXNlbnRzLlxuICAgKiBGb3IgZXhhbXBsZSwgYSAnc2VsZWN0QWxsKCknIGZ1bmN0aW9uIHdvdWxkIGxpa2VseSB3YW50IHRvIHNlbGVjdCB0aGUgc2V0IG9mIGZpbHRlcmVkIGRhdGFcbiAgICogc2hvd24gdG8gdGhlIHVzZXIgcmF0aGVyIHRoYW4gYWxsIHRoZSBkYXRhLlxuICAgKi9cbiAgZmlsdGVyZWREYXRhOiBUW107XG5cbiAgLyoqIEFycmF5IG9mIGRhdGEgdGhhdCBzaG91bGQgYmUgcmVuZGVyZWQgYnkgdGhlIHRhYmxlLCB3aGVyZSBlYWNoIG9iamVjdCByZXByZXNlbnRzIG9uZSByb3cuICovXG4gIGdldCBkYXRhKCkgeyByZXR1cm4gdGhpcy5fZGF0YS52YWx1ZTsgfVxuICBzZXQgZGF0YShkYXRhOiBUW10pIHsgdGhpcy5fZGF0YS5uZXh0KGRhdGEpOyB9XG5cbiAgLyoqXG4gICAqIEZpbHRlciB0ZXJtIHRoYXQgc2hvdWxkIGJlIHVzZWQgdG8gZmlsdGVyIG91dCBvYmplY3RzIGZyb20gdGhlIGRhdGEgYXJyYXkuIFRvIG92ZXJyaWRlIGhvd1xuICAgKiBkYXRhIG9iamVjdHMgbWF0Y2ggdG8gdGhpcyBmaWx0ZXIgc3RyaW5nLCBwcm92aWRlIGEgY3VzdG9tIGZ1bmN0aW9uIGZvciBmaWx0ZXJQcmVkaWNhdGUuXG4gICAqL1xuICBnZXQgZmlsdGVyKCk6IHN0cmluZyB7IHJldHVybiB0aGlzLl9maWx0ZXIudmFsdWU7IH1cbiAgc2V0IGZpbHRlcihmaWx0ZXI6IHN0cmluZykgeyB0aGlzLl9maWx0ZXIubmV4dChmaWx0ZXIpOyB9XG5cbiAgLyoqXG4gICAqIEluc3RhbmNlIG9mIHRoZSBNYXRTb3J0IGRpcmVjdGl2ZSB1c2VkIGJ5IHRoZSB0YWJsZSB0byBjb250cm9sIGl0cyBzb3J0aW5nLiBTb3J0IGNoYW5nZXNcbiAgICogZW1pdHRlZCBieSB0aGUgTWF0U29ydCB3aWxsIHRyaWdnZXIgYW4gdXBkYXRlIHRvIHRoZSB0YWJsZSdzIHJlbmRlcmVkIGRhdGEuXG4gICAqL1xuICBnZXQgc29ydCgpOiBNYXRTb3J0IHwgbnVsbCB7IHJldHVybiB0aGlzLl9zb3J0OyB9XG4gIHNldCBzb3J0KHNvcnQ6IE1hdFNvcnR8bnVsbCkge1xuICAgIHRoaXMuX3NvcnQgPSBzb3J0O1xuICAgIHRoaXMuX3VwZGF0ZUNoYW5nZVN1YnNjcmlwdGlvbigpO1xuICB9XG4gIHByaXZhdGUgX3NvcnQ6IE1hdFNvcnR8bnVsbDtcblxuICAvKipcbiAgICogSW5zdGFuY2Ugb2YgdGhlIE1hdFBhZ2luYXRvciBjb21wb25lbnQgdXNlZCBieSB0aGUgdGFibGUgdG8gY29udHJvbCB3aGF0IHBhZ2Ugb2YgdGhlIGRhdGEgaXNcbiAgICogZGlzcGxheWVkLiBQYWdlIGNoYW5nZXMgZW1pdHRlZCBieSB0aGUgTWF0UGFnaW5hdG9yIHdpbGwgdHJpZ2dlciBhbiB1cGRhdGUgdG8gdGhlXG4gICAqIHRhYmxlJ3MgcmVuZGVyZWQgZGF0YS5cbiAgICpcbiAgICogTm90ZSB0aGF0IHRoZSBkYXRhIHNvdXJjZSB1c2VzIHRoZSBwYWdpbmF0b3IncyBwcm9wZXJ0aWVzIHRvIGNhbGN1bGF0ZSB3aGljaCBwYWdlIG9mIGRhdGFcbiAgICogc2hvdWxkIGJlIGRpc3BsYXllZC4gSWYgdGhlIHBhZ2luYXRvciByZWNlaXZlcyBpdHMgcHJvcGVydGllcyBhcyB0ZW1wbGF0ZSBpbnB1dHMsXG4gICAqIGUuZy4gYFtwYWdlTGVuZ3RoXT0xMDBgIG9yIGBbcGFnZUluZGV4XT0xYCwgdGhlbiBiZSBzdXJlIHRoYXQgdGhlIHBhZ2luYXRvcidzIHZpZXcgaGFzIGJlZW5cbiAgICogaW5pdGlhbGl6ZWQgYmVmb3JlIGFzc2lnbmluZyBpdCB0byB0aGlzIGRhdGEgc291cmNlLlxuICAgKi9cbiAgZ2V0IHBhZ2luYXRvcigpOiBQIHwgbnVsbCB7IHJldHVybiB0aGlzLl9wYWdpbmF0b3I7IH1cbiAgc2V0IHBhZ2luYXRvcihwYWdpbmF0b3I6IFAgfCBudWxsKSB7XG4gICAgdGhpcy5fcGFnaW5hdG9yID0gcGFnaW5hdG9yO1xuICAgIHRoaXMuX3VwZGF0ZUNoYW5nZVN1YnNjcmlwdGlvbigpO1xuICB9XG4gIHByaXZhdGUgX3BhZ2luYXRvcjogUCB8IG51bGw7XG5cbiAgLyoqXG4gICAqIERhdGEgYWNjZXNzb3IgZnVuY3Rpb24gdGhhdCBpcyB1c2VkIGZvciBhY2Nlc3NpbmcgZGF0YSBwcm9wZXJ0aWVzIGZvciBzb3J0aW5nIHRocm91Z2hcbiAgICogdGhlIGRlZmF1bHQgc29ydERhdGEgZnVuY3Rpb24uXG4gICAqIFRoaXMgZGVmYXVsdCBmdW5jdGlvbiBhc3N1bWVzIHRoYXQgdGhlIHNvcnQgaGVhZGVyIElEcyAod2hpY2ggZGVmYXVsdHMgdG8gdGhlIGNvbHVtbiBuYW1lKVxuICAgKiBtYXRjaGVzIHRoZSBkYXRhJ3MgcHJvcGVydGllcyAoZS5nLiBjb2x1bW4gWHl6IHJlcHJlc2VudHMgZGF0YVsnWHl6J10pLlxuICAgKiBNYXkgYmUgc2V0IHRvIGEgY3VzdG9tIGZ1bmN0aW9uIGZvciBkaWZmZXJlbnQgYmVoYXZpb3IuXG4gICAqIEBwYXJhbSBkYXRhIERhdGEgb2JqZWN0IHRoYXQgaXMgYmVpbmcgYWNjZXNzZWQuXG4gICAqIEBwYXJhbSBzb3J0SGVhZGVySWQgVGhlIG5hbWUgb2YgdGhlIGNvbHVtbiB0aGF0IHJlcHJlc2VudHMgdGhlIGRhdGEuXG4gICAqL1xuICBzb3J0aW5nRGF0YUFjY2Vzc29yOiAoKGRhdGE6IFQsIHNvcnRIZWFkZXJJZDogc3RyaW5nKSA9PiBzdHJpbmd8bnVtYmVyKSA9XG4gICAgICAoZGF0YTogVCwgc29ydEhlYWRlcklkOiBzdHJpbmcpOiBzdHJpbmd8bnVtYmVyID0+IHtcbiAgICBjb25zdCB2YWx1ZSA9IChkYXRhIGFzIHtba2V5OiBzdHJpbmddOiBhbnl9KVtzb3J0SGVhZGVySWRdO1xuXG4gICAgaWYgKF9pc051bWJlclZhbHVlKHZhbHVlKSkge1xuICAgICAgY29uc3QgbnVtYmVyVmFsdWUgPSBOdW1iZXIodmFsdWUpO1xuXG4gICAgICAvLyBOdW1iZXJzIGJleW9uZCBgTUFYX1NBRkVfSU5URUdFUmAgY2FuJ3QgYmUgY29tcGFyZWQgcmVsaWFibHkgc28gd2VcbiAgICAgIC8vIGxlYXZlIHRoZW0gYXMgc3RyaW5ncy4gRm9yIG1vcmUgaW5mbzogaHR0cHM6Ly9nb28uZ2wveTV2YlNnXG4gICAgICByZXR1cm4gbnVtYmVyVmFsdWUgPCBNQVhfU0FGRV9JTlRFR0VSID8gbnVtYmVyVmFsdWUgOiB2YWx1ZTtcbiAgICB9XG5cbiAgICByZXR1cm4gdmFsdWU7XG4gIH1cblxuICAvKipcbiAgICogR2V0cyBhIHNvcnRlZCBjb3B5IG9mIHRoZSBkYXRhIGFycmF5IGJhc2VkIG9uIHRoZSBzdGF0ZSBvZiB0aGUgTWF0U29ydC4gQ2FsbGVkXG4gICAqIGFmdGVyIGNoYW5nZXMgYXJlIG1hZGUgdG8gdGhlIGZpbHRlcmVkIGRhdGEgb3Igd2hlbiBzb3J0IGNoYW5nZXMgYXJlIGVtaXR0ZWQgZnJvbSBNYXRTb3J0LlxuICAgKiBCeSBkZWZhdWx0LCB0aGUgZnVuY3Rpb24gcmV0cmlldmVzIHRoZSBhY3RpdmUgc29ydCBhbmQgaXRzIGRpcmVjdGlvbiBhbmQgY29tcGFyZXMgZGF0YVxuICAgKiBieSByZXRyaWV2aW5nIGRhdGEgdXNpbmcgdGhlIHNvcnRpbmdEYXRhQWNjZXNzb3IuIE1heSBiZSBvdmVycmlkZGVuIGZvciBhIGN1c3RvbSBpbXBsZW1lbnRhdGlvblxuICAgKiBvZiBkYXRhIG9yZGVyaW5nLlxuICAgKiBAcGFyYW0gZGF0YSBUaGUgYXJyYXkgb2YgZGF0YSB0aGF0IHNob3VsZCBiZSBzb3J0ZWQuXG4gICAqIEBwYXJhbSBzb3J0IFRoZSBjb25uZWN0ZWQgTWF0U29ydCB0aGF0IGhvbGRzIHRoZSBjdXJyZW50IHNvcnQgc3RhdGUuXG4gICAqL1xuICBzb3J0RGF0YTogKChkYXRhOiBUW10sIHNvcnQ6IE1hdFNvcnQpID0+IFRbXSkgPSAoZGF0YTogVFtdLCBzb3J0OiBNYXRTb3J0KTogVFtdID0+IHtcbiAgICBjb25zdCBhY3RpdmUgPSBzb3J0LmFjdGl2ZTtcbiAgICBjb25zdCBkaXJlY3Rpb24gPSBzb3J0LmRpcmVjdGlvbjtcbiAgICBpZiAoIWFjdGl2ZSB8fCBkaXJlY3Rpb24gPT0gJycpIHsgcmV0dXJuIGRhdGE7IH1cblxuICAgIHJldHVybiBkYXRhLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgIGxldCB2YWx1ZUEgPSB0aGlzLnNvcnRpbmdEYXRhQWNjZXNzb3IoYSwgYWN0aXZlKTtcbiAgICAgIGxldCB2YWx1ZUIgPSB0aGlzLnNvcnRpbmdEYXRhQWNjZXNzb3IoYiwgYWN0aXZlKTtcblxuICAgICAgLy8gSWYgdGhlcmUgYXJlIGRhdGEgaW4gdGhlIGNvbHVtbiB0aGF0IGNhbiBiZSBjb252ZXJ0ZWQgdG8gYSBudW1iZXIsXG4gICAgICAvLyBpdCBtdXN0IGJlIGVuc3VyZWQgdGhhdCB0aGUgcmVzdCBvZiB0aGUgZGF0YVxuICAgICAgLy8gaXMgb2YgdGhlIHNhbWUgdHlwZSBzbyBhcyBub3QgdG8gb3JkZXIgaW5jb3JyZWN0bHkuXG4gICAgICBjb25zdCB2YWx1ZUFUeXBlID0gdHlwZW9mIHZhbHVlQTtcbiAgICAgIGNvbnN0IHZhbHVlQlR5cGUgPSB0eXBlb2YgdmFsdWVCO1xuXG4gICAgICBpZiAodmFsdWVBVHlwZSAhPT0gdmFsdWVCVHlwZSkge1xuICAgICAgICBpZiAodmFsdWVBVHlwZSA9PT0gJ251bWJlcicpIHsgdmFsdWVBICs9ICcnOyB9XG4gICAgICAgIGlmICh2YWx1ZUJUeXBlID09PSAnbnVtYmVyJykgeyB2YWx1ZUIgKz0gJyc7IH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgYm90aCB2YWx1ZUEgYW5kIHZhbHVlQiBleGlzdCAodHJ1dGh5KSwgdGhlbiBjb21wYXJlIHRoZSB0d28uIE90aGVyd2lzZSwgY2hlY2sgaWZcbiAgICAgIC8vIG9uZSB2YWx1ZSBleGlzdHMgd2hpbGUgdGhlIG90aGVyIGRvZXNuJ3QuIEluIHRoaXMgY2FzZSwgZXhpc3RpbmcgdmFsdWUgc2hvdWxkIGNvbWUgbGFzdC5cbiAgICAgIC8vIFRoaXMgYXZvaWRzIGluY29uc2lzdGVudCByZXN1bHRzIHdoZW4gY29tcGFyaW5nIHZhbHVlcyB0byB1bmRlZmluZWQvbnVsbC5cbiAgICAgIC8vIElmIG5laXRoZXIgdmFsdWUgZXhpc3RzLCByZXR1cm4gMCAoZXF1YWwpLlxuICAgICAgbGV0IGNvbXBhcmF0b3JSZXN1bHQgPSAwO1xuICAgICAgaWYgKHZhbHVlQSAhPSBudWxsICYmIHZhbHVlQiAhPSBudWxsKSB7XG4gICAgICAgIC8vIENoZWNrIGlmIG9uZSB2YWx1ZSBpcyBncmVhdGVyIHRoYW4gdGhlIG90aGVyOyBpZiBlcXVhbCwgY29tcGFyYXRvclJlc3VsdCBzaG91bGQgcmVtYWluIDAuXG4gICAgICAgIGlmICh2YWx1ZUEgPiB2YWx1ZUIpIHtcbiAgICAgICAgICBjb21wYXJhdG9yUmVzdWx0ID0gMTtcbiAgICAgICAgfSBlbHNlIGlmICh2YWx1ZUEgPCB2YWx1ZUIpIHtcbiAgICAgICAgICBjb21wYXJhdG9yUmVzdWx0ID0gLTE7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodmFsdWVBICE9IG51bGwpIHtcbiAgICAgICAgY29tcGFyYXRvclJlc3VsdCA9IDE7XG4gICAgICB9IGVsc2UgaWYgKHZhbHVlQiAhPSBudWxsKSB7XG4gICAgICAgIGNvbXBhcmF0b3JSZXN1bHQgPSAtMTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGNvbXBhcmF0b3JSZXN1bHQgKiAoZGlyZWN0aW9uID09ICdhc2MnID8gMSA6IC0xKTtcbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBDaGVja3MgaWYgYSBkYXRhIG9iamVjdCBtYXRjaGVzIHRoZSBkYXRhIHNvdXJjZSdzIGZpbHRlciBzdHJpbmcuIEJ5IGRlZmF1bHQsIGVhY2ggZGF0YSBvYmplY3RcbiAgICogaXMgY29udmVydGVkIHRvIGEgc3RyaW5nIG9mIGl0cyBwcm9wZXJ0aWVzIGFuZCByZXR1cm5zIHRydWUgaWYgdGhlIGZpbHRlciBoYXNcbiAgICogYXQgbGVhc3Qgb25lIG9jY3VycmVuY2UgaW4gdGhhdCBzdHJpbmcuIEJ5IGRlZmF1bHQsIHRoZSBmaWx0ZXIgc3RyaW5nIGhhcyBpdHMgd2hpdGVzcGFjZVxuICAgKiB0cmltbWVkIGFuZCB0aGUgbWF0Y2ggaXMgY2FzZS1pbnNlbnNpdGl2ZS4gTWF5IGJlIG92ZXJyaWRkZW4gZm9yIGEgY3VzdG9tIGltcGxlbWVudGF0aW9uIG9mXG4gICAqIGZpbHRlciBtYXRjaGluZy5cbiAgICogQHBhcmFtIGRhdGEgRGF0YSBvYmplY3QgdXNlZCB0byBjaGVjayBhZ2FpbnN0IHRoZSBmaWx0ZXIuXG4gICAqIEBwYXJhbSBmaWx0ZXIgRmlsdGVyIHN0cmluZyB0aGF0IGhhcyBiZWVuIHNldCBvbiB0aGUgZGF0YSBzb3VyY2UuXG4gICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIGZpbHRlciBtYXRjaGVzIGFnYWluc3QgdGhlIGRhdGFcbiAgICovXG4gIGZpbHRlclByZWRpY2F0ZTogKChkYXRhOiBULCBmaWx0ZXI6IHN0cmluZykgPT4gYm9vbGVhbikgPSAoZGF0YTogVCwgZmlsdGVyOiBzdHJpbmcpOiBib29sZWFuID0+IHtcbiAgICAvLyBUcmFuc2Zvcm0gdGhlIGRhdGEgaW50byBhIGxvd2VyY2FzZSBzdHJpbmcgb2YgYWxsIHByb3BlcnR5IHZhbHVlcy5cbiAgICBjb25zdCBkYXRhU3RyID0gT2JqZWN0LmtleXMoZGF0YSkucmVkdWNlKChjdXJyZW50VGVybTogc3RyaW5nLCBrZXk6IHN0cmluZykgPT4ge1xuICAgICAgLy8gVXNlIGFuIG9ic2N1cmUgVW5pY29kZSBjaGFyYWN0ZXIgdG8gZGVsaW1pdCB0aGUgd29yZHMgaW4gdGhlIGNvbmNhdGVuYXRlZCBzdHJpbmcuXG4gICAgICAvLyBUaGlzIGF2b2lkcyBtYXRjaGVzIHdoZXJlIHRoZSB2YWx1ZXMgb2YgdHdvIGNvbHVtbnMgY29tYmluZWQgd2lsbCBtYXRjaCB0aGUgdXNlcidzIHF1ZXJ5XG4gICAgICAvLyAoZS5nLiBgRmx1dGVgIGFuZCBgU3RvcGAgd2lsbCBtYXRjaCBgVGVzdGApLiBUaGUgY2hhcmFjdGVyIGlzIGludGVuZGVkIHRvIGJlIHNvbWV0aGluZ1xuICAgICAgLy8gdGhhdCBoYXMgYSB2ZXJ5IGxvdyBjaGFuY2Ugb2YgYmVpbmcgdHlwZWQgaW4gYnkgc29tZWJvZHkgaW4gYSB0ZXh0IGZpZWxkLiBUaGlzIG9uZSBpblxuICAgICAgLy8gcGFydGljdWxhciBpcyBcIldoaXRlIHVwLXBvaW50aW5nIHRyaWFuZ2xlIHdpdGggZG90XCIgZnJvbVxuICAgICAgLy8gaHR0cHM6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvTGlzdF9vZl9Vbmljb2RlX2NoYXJhY3RlcnNcbiAgICAgIHJldHVybiBjdXJyZW50VGVybSArIChkYXRhIGFzIHtba2V5OiBzdHJpbmddOiBhbnl9KVtrZXldICsgJ+KXrCc7XG4gICAgfSwgJycpLnRvTG93ZXJDYXNlKCk7XG5cbiAgICAvLyBUcmFuc2Zvcm0gdGhlIGZpbHRlciBieSBjb252ZXJ0aW5nIGl0IHRvIGxvd2VyY2FzZSBhbmQgcmVtb3Zpbmcgd2hpdGVzcGFjZS5cbiAgICBjb25zdCB0cmFuc2Zvcm1lZEZpbHRlciA9IGZpbHRlci50cmltKCkudG9Mb3dlckNhc2UoKTtcblxuICAgIHJldHVybiBkYXRhU3RyLmluZGV4T2YodHJhbnNmb3JtZWRGaWx0ZXIpICE9IC0xO1xuICB9XG5cbiAgY29uc3RydWN0b3IoaW5pdGlhbERhdGE6IFRbXSA9IFtdKSB7XG4gICAgc3VwZXIoKTtcbiAgICB0aGlzLl9kYXRhID0gbmV3IEJlaGF2aW9yU3ViamVjdDxUW10+KGluaXRpYWxEYXRhKTtcbiAgICB0aGlzLl91cGRhdGVDaGFuZ2VTdWJzY3JpcHRpb24oKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdWJzY3JpYmUgdG8gY2hhbmdlcyB0aGF0IHNob3VsZCB0cmlnZ2VyIGFuIHVwZGF0ZSB0byB0aGUgdGFibGUncyByZW5kZXJlZCByb3dzLiBXaGVuIHRoZVxuICAgKiBjaGFuZ2VzIG9jY3VyLCBwcm9jZXNzIHRoZSBjdXJyZW50IHN0YXRlIG9mIHRoZSBmaWx0ZXIsIHNvcnQsIGFuZCBwYWdpbmF0aW9uIGFsb25nIHdpdGhcbiAgICogdGhlIHByb3ZpZGVkIGJhc2UgZGF0YSBhbmQgc2VuZCBpdCB0byB0aGUgdGFibGUgZm9yIHJlbmRlcmluZy5cbiAgICovXG4gIF91cGRhdGVDaGFuZ2VTdWJzY3JpcHRpb24oKSB7XG4gICAgLy8gU29ydGluZyBhbmQvb3IgcGFnaW5hdGlvbiBzaG91bGQgYmUgd2F0Y2hlZCBpZiBNYXRTb3J0IGFuZC9vciBNYXRQYWdpbmF0b3IgYXJlIHByb3ZpZGVkLlxuICAgIC8vIFRoZSBldmVudHMgc2hvdWxkIGVtaXQgd2hlbmV2ZXIgdGhlIGNvbXBvbmVudCBlbWl0cyBhIGNoYW5nZSBvciBpbml0aWFsaXplcywgb3IgaWYgbm9cbiAgICAvLyBjb21wb25lbnQgaXMgcHJvdmlkZWQsIGEgc3RyZWFtIHdpdGgganVzdCBhIG51bGwgZXZlbnQgc2hvdWxkIGJlIHByb3ZpZGVkLlxuICAgIC8vIFRoZSBgc29ydENoYW5nZWAgYW5kIGBwYWdlQ2hhbmdlYCBhY3RzIGFzIGEgc2lnbmFsIHRvIHRoZSBjb21iaW5lTGF0ZXN0cyBiZWxvdyBzbyB0aGF0IHRoZVxuICAgIC8vIHBpcGVsaW5lIGNhbiBwcm9ncmVzcyB0byB0aGUgbmV4dCBzdGVwLiBOb3RlIHRoYXQgdGhlIHZhbHVlIGZyb20gdGhlc2Ugc3RyZWFtcyBhcmUgbm90IHVzZWQsXG4gICAgLy8gdGhleSBwdXJlbHkgYWN0IGFzIGEgc2lnbmFsIHRvIHByb2dyZXNzIGluIHRoZSBwaXBlbGluZS5cbiAgICBjb25zdCBzb3J0Q2hhbmdlOiBPYnNlcnZhYmxlPFNvcnR8bnVsbHx2b2lkPiA9IHRoaXMuX3NvcnQgP1xuICAgICAgICBtZXJnZSh0aGlzLl9zb3J0LnNvcnRDaGFuZ2UsIHRoaXMuX3NvcnQuaW5pdGlhbGl6ZWQpIGFzIE9ic2VydmFibGU8U29ydHx2b2lkPiA6XG4gICAgICAgIG9ic2VydmFibGVPZihudWxsKTtcbiAgICBjb25zdCBwYWdlQ2hhbmdlOiBPYnNlcnZhYmxlPFBhZ2VFdmVudHxudWxsfHZvaWQ+ID0gdGhpcy5fcGFnaW5hdG9yID9cbiAgICAgICAgbWVyZ2UoXG4gICAgICAgICAgdGhpcy5fcGFnaW5hdG9yLnBhZ2UsXG4gICAgICAgICAgdGhpcy5faW50ZXJuYWxQYWdlQ2hhbmdlcyxcbiAgICAgICAgICB0aGlzLl9wYWdpbmF0b3IuaW5pdGlhbGl6ZWRcbiAgICAgICAgKSBhcyBPYnNlcnZhYmxlPFBhZ2VFdmVudHx2b2lkPiA6XG4gICAgICAgIG9ic2VydmFibGVPZihudWxsKTtcbiAgICBjb25zdCBkYXRhU3RyZWFtID0gdGhpcy5fZGF0YTtcbiAgICAvLyBXYXRjaCBmb3IgYmFzZSBkYXRhIG9yIGZpbHRlciBjaGFuZ2VzIHRvIHByb3ZpZGUgYSBmaWx0ZXJlZCBzZXQgb2YgZGF0YS5cbiAgICBjb25zdCBmaWx0ZXJlZERhdGEgPSBjb21iaW5lTGF0ZXN0KFtkYXRhU3RyZWFtLCB0aGlzLl9maWx0ZXJdKVxuICAgICAgLnBpcGUobWFwKChbZGF0YV0pID0+IHRoaXMuX2ZpbHRlckRhdGEoZGF0YSkpKTtcbiAgICAvLyBXYXRjaCBmb3IgZmlsdGVyZWQgZGF0YSBvciBzb3J0IGNoYW5nZXMgdG8gcHJvdmlkZSBhbiBvcmRlcmVkIHNldCBvZiBkYXRhLlxuICAgIGNvbnN0IG9yZGVyZWREYXRhID0gY29tYmluZUxhdGVzdChbZmlsdGVyZWREYXRhLCBzb3J0Q2hhbmdlXSlcbiAgICAgIC5waXBlKG1hcCgoW2RhdGFdKSA9PiB0aGlzLl9vcmRlckRhdGEoZGF0YSkpKTtcbiAgICAvLyBXYXRjaCBmb3Igb3JkZXJlZCBkYXRhIG9yIHBhZ2UgY2hhbmdlcyB0byBwcm92aWRlIGEgcGFnZWQgc2V0IG9mIGRhdGEuXG4gICAgY29uc3QgcGFnaW5hdGVkRGF0YSA9IGNvbWJpbmVMYXRlc3QoW29yZGVyZWREYXRhLCBwYWdlQ2hhbmdlXSlcbiAgICAgIC5waXBlKG1hcCgoW2RhdGFdKSA9PiB0aGlzLl9wYWdlRGF0YShkYXRhKSkpO1xuICAgIC8vIFdhdGNoZWQgZm9yIHBhZ2VkIGRhdGEgY2hhbmdlcyBhbmQgc2VuZCB0aGUgcmVzdWx0IHRvIHRoZSB0YWJsZSB0byByZW5kZXIuXG4gICAgdGhpcy5fcmVuZGVyQ2hhbmdlc1N1YnNjcmlwdGlvbi51bnN1YnNjcmliZSgpO1xuICAgIHRoaXMuX3JlbmRlckNoYW5nZXNTdWJzY3JpcHRpb24gPSBwYWdpbmF0ZWREYXRhLnN1YnNjcmliZShkYXRhID0+IHRoaXMuX3JlbmRlckRhdGEubmV4dChkYXRhKSk7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIGZpbHRlcmVkIGRhdGEgYXJyYXkgd2hlcmUgZWFjaCBmaWx0ZXIgb2JqZWN0IGNvbnRhaW5zIHRoZSBmaWx0ZXIgc3RyaW5nIHdpdGhpblxuICAgKiB0aGUgcmVzdWx0IG9mIHRoZSBmaWx0ZXJUZXJtQWNjZXNzb3IgZnVuY3Rpb24uIElmIG5vIGZpbHRlciBpcyBzZXQsIHJldHVybnMgdGhlIGRhdGEgYXJyYXlcbiAgICogYXMgcHJvdmlkZWQuXG4gICAqL1xuICBfZmlsdGVyRGF0YShkYXRhOiBUW10pIHtcbiAgICAvLyBJZiB0aGVyZSBpcyBhIGZpbHRlciBzdHJpbmcsIGZpbHRlciBvdXQgZGF0YSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gaXQuXG4gICAgLy8gRWFjaCBkYXRhIG9iamVjdCBpcyBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcgdXNpbmcgdGhlIGZ1bmN0aW9uIGRlZmluZWQgYnkgZmlsdGVyVGVybUFjY2Vzc29yLlxuICAgIC8vIE1heSBiZSBvdmVycmlkZGVuIGZvciBjdXN0b21pemF0aW9uLlxuICAgIHRoaXMuZmlsdGVyZWREYXRhID0gKHRoaXMuZmlsdGVyID09IG51bGwgfHwgdGhpcy5maWx0ZXIgPT09ICcnKSA/IGRhdGEgOlxuICAgICAgICBkYXRhLmZpbHRlcihvYmogPT4gdGhpcy5maWx0ZXJQcmVkaWNhdGUob2JqLCB0aGlzLmZpbHRlcikpO1xuXG4gICAgaWYgKHRoaXMucGFnaW5hdG9yKSB7IHRoaXMuX3VwZGF0ZVBhZ2luYXRvcih0aGlzLmZpbHRlcmVkRGF0YS5sZW5ndGgpOyB9XG5cbiAgICByZXR1cm4gdGhpcy5maWx0ZXJlZERhdGE7XG4gIH1cblxuICAvKipcbiAgICogUmV0dXJucyBhIHNvcnRlZCBjb3B5IG9mIHRoZSBkYXRhIGlmIE1hdFNvcnQgaGFzIGEgc29ydCBhcHBsaWVkLCBvdGhlcndpc2UganVzdCByZXR1cm5zIHRoZVxuICAgKiBkYXRhIGFycmF5IGFzIHByb3ZpZGVkLiBVc2VzIHRoZSBkZWZhdWx0IGRhdGEgYWNjZXNzb3IgZm9yIGRhdGEgbG9va3VwLCB1bmxlc3MgYVxuICAgKiBzb3J0RGF0YUFjY2Vzc29yIGZ1bmN0aW9uIGlzIGRlZmluZWQuXG4gICAqL1xuICBfb3JkZXJEYXRhKGRhdGE6IFRbXSk6IFRbXSB7XG4gICAgLy8gSWYgdGhlcmUgaXMgbm8gYWN0aXZlIHNvcnQgb3IgZGlyZWN0aW9uLCByZXR1cm4gdGhlIGRhdGEgd2l0aG91dCB0cnlpbmcgdG8gc29ydC5cbiAgICBpZiAoIXRoaXMuc29ydCkgeyByZXR1cm4gZGF0YTsgfVxuXG4gICAgcmV0dXJuIHRoaXMuc29ydERhdGEoZGF0YS5zbGljZSgpLCB0aGlzLnNvcnQpO1xuICB9XG5cbiAgLyoqXG4gICAqIFJldHVybnMgYSBwYWdlZCBzbGljZSBvZiB0aGUgcHJvdmlkZWQgZGF0YSBhcnJheSBhY2NvcmRpbmcgdG8gdGhlIHByb3ZpZGVkIE1hdFBhZ2luYXRvcidzIHBhZ2VcbiAgICogaW5kZXggYW5kIGxlbmd0aC4gSWYgdGhlcmUgaXMgbm8gcGFnaW5hdG9yIHByb3ZpZGVkLCByZXR1cm5zIHRoZSBkYXRhIGFycmF5IGFzIHByb3ZpZGVkLlxuICAgKi9cbiAgX3BhZ2VEYXRhKGRhdGE6IFRbXSk6IFRbXSB7XG4gICAgaWYgKCF0aGlzLnBhZ2luYXRvcikgeyByZXR1cm4gZGF0YTsgfVxuXG4gICAgY29uc3Qgc3RhcnRJbmRleCA9IHRoaXMucGFnaW5hdG9yLnBhZ2VJbmRleCAqIHRoaXMucGFnaW5hdG9yLnBhZ2VTaXplO1xuICAgIHJldHVybiBkYXRhLnNsaWNlKHN0YXJ0SW5kZXgsIHN0YXJ0SW5kZXggKyB0aGlzLnBhZ2luYXRvci5wYWdlU2l6ZSk7XG4gIH1cblxuICAvKipcbiAgICogVXBkYXRlcyB0aGUgcGFnaW5hdG9yIHRvIHJlZmxlY3QgdGhlIGxlbmd0aCBvZiB0aGUgZmlsdGVyZWQgZGF0YSwgYW5kIG1ha2VzIHN1cmUgdGhhdCB0aGUgcGFnZVxuICAgKiBpbmRleCBkb2VzIG5vdCBleGNlZWQgdGhlIHBhZ2luYXRvcidzIGxhc3QgcGFnZS4gVmFsdWVzIGFyZSBjaGFuZ2VkIGluIGEgcmVzb2x2ZWQgcHJvbWlzZSB0b1xuICAgKiBndWFyZCBhZ2FpbnN0IG1ha2luZyBwcm9wZXJ0eSBjaGFuZ2VzIHdpdGhpbiBhIHJvdW5kIG9mIGNoYW5nZSBkZXRlY3Rpb24uXG4gICAqL1xuICBfdXBkYXRlUGFnaW5hdG9yKGZpbHRlcmVkRGF0YUxlbmd0aDogbnVtYmVyKSB7XG4gICAgUHJvbWlzZS5yZXNvbHZlKCkudGhlbigoKSA9PiB7XG4gICAgICBjb25zdCBwYWdpbmF0b3IgPSB0aGlzLnBhZ2luYXRvcjtcblxuICAgICAgaWYgKCFwYWdpbmF0b3IpIHsgcmV0dXJuOyB9XG5cbiAgICAgIHBhZ2luYXRvci5sZW5ndGggPSBmaWx0ZXJlZERhdGFMZW5ndGg7XG5cbiAgICAgIC8vIElmIHRoZSBwYWdlIGluZGV4IGlzIHNldCBiZXlvbmQgdGhlIHBhZ2UsIHJlZHVjZSBpdCB0byB0aGUgbGFzdCBwYWdlLlxuICAgICAgaWYgKHBhZ2luYXRvci5wYWdlSW5kZXggPiAwKSB7XG4gICAgICAgIGNvbnN0IGxhc3RQYWdlSW5kZXggPSBNYXRoLmNlaWwocGFnaW5hdG9yLmxlbmd0aCAvIHBhZ2luYXRvci5wYWdlU2l6ZSkgLSAxIHx8IDA7XG4gICAgICAgIGNvbnN0IG5ld1BhZ2VJbmRleCA9IE1hdGgubWluKHBhZ2luYXRvci5wYWdlSW5kZXgsIGxhc3RQYWdlSW5kZXgpO1xuXG4gICAgICAgIGlmIChuZXdQYWdlSW5kZXggIT09IHBhZ2luYXRvci5wYWdlSW5kZXgpIHtcbiAgICAgICAgICBwYWdpbmF0b3IucGFnZUluZGV4ID0gbmV3UGFnZUluZGV4O1xuXG4gICAgICAgICAgLy8gU2luY2UgdGhlIHBhZ2luYXRvciBvbmx5IGVtaXRzIGFmdGVyIHVzZXItZ2VuZXJhdGVkIGNoYW5nZXMsXG4gICAgICAgICAgLy8gd2UgbmVlZCBvdXIgb3duIHN0cmVhbSBzbyB3ZSBrbm93IHRvIHNob3VsZCByZS1yZW5kZXIgdGhlIGRhdGEuXG4gICAgICAgICAgdGhpcy5faW50ZXJuYWxQYWdlQ2hhbmdlcy5uZXh0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGJ5IHRoZSBNYXRUYWJsZS4gQ2FsbGVkIHdoZW4gaXQgY29ubmVjdHMgdG8gdGhlIGRhdGEgc291cmNlLlxuICAgKiBAZG9jcy1wcml2YXRlXG4gICAqL1xuICBjb25uZWN0KCkgeyByZXR1cm4gdGhpcy5fcmVuZGVyRGF0YTsgfVxuXG4gIC8qKlxuICAgKiBVc2VkIGJ5IHRoZSBNYXRUYWJsZS4gQ2FsbGVkIHdoZW4gaXQgaXMgZGVzdHJveWVkLiBOby1vcC5cbiAgICogQGRvY3MtcHJpdmF0ZVxuICAgKi9cbiAgZGlzY29ubmVjdCgpIHsgfVxufVxuXG4vKipcbiAqIERhdGEgc291cmNlIHRoYXQgYWNjZXB0cyBhIGNsaWVudC1zaWRlIGRhdGEgYXJyYXkgYW5kIGluY2x1ZGVzIG5hdGl2ZSBzdXBwb3J0IG9mIGZpbHRlcmluZyxcbiAqIHNvcnRpbmcgKHVzaW5nIE1hdFNvcnQpLCBhbmQgcGFnaW5hdGlvbiAodXNpbmcgTWF0UGFnaW5hdG9yKS5cbiAqXG4gKiBBbGxvd3MgZm9yIHNvcnQgY3VzdG9taXphdGlvbiBieSBvdmVycmlkaW5nIHNvcnRpbmdEYXRhQWNjZXNzb3IsIHdoaWNoIGRlZmluZXMgaG93IGRhdGFcbiAqIHByb3BlcnRpZXMgYXJlIGFjY2Vzc2VkLiBBbHNvIGFsbG93cyBmb3IgZmlsdGVyIGN1c3RvbWl6YXRpb24gYnkgb3ZlcnJpZGluZyBmaWx0ZXJUZXJtQWNjZXNzb3IsXG4gKiB3aGljaCBkZWZpbmVzIGhvdyByb3cgZGF0YSBpcyBjb252ZXJ0ZWQgdG8gYSBzdHJpbmcgZm9yIGZpbHRlciBtYXRjaGluZy5cbiAqXG4gKiAqKk5vdGU6KiogVGhpcyBjbGFzcyBpcyBtZWFudCB0byBiZSBhIHNpbXBsZSBkYXRhIHNvdXJjZSB0byBoZWxwIHlvdSBnZXQgc3RhcnRlZC4gQXMgc3VjaFxuICogaXQgaXNuJ3QgZXF1aXBwZWQgdG8gaGFuZGxlIHNvbWUgbW9yZSBhZHZhbmNlZCBjYXNlcyBsaWtlIHJvYnVzdCBpMThuIHN1cHBvcnQgb3Igc2VydmVyLXNpZGVcbiAqIGludGVyYWN0aW9ucy4gSWYgeW91ciBhcHAgbmVlZHMgdG8gc3VwcG9ydCBtb3JlIGFkdmFuY2VkIHVzZSBjYXNlcywgY29uc2lkZXIgaW1wbGVtZW50aW5nIHlvdXJcbiAqIG93biBgRGF0YVNvdXJjZWAuXG4gKi9cbmV4cG9ydCBjbGFzcyBNYXRUYWJsZURhdGFTb3VyY2U8VD4gZXh0ZW5kcyBfTWF0VGFibGVEYXRhU291cmNlPFQsIE1hdFBhZ2luYXRvcj4ge31cbiJdfQ==