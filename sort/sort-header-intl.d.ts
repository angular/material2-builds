/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { Optional } from '@angular/core';
import { Subject } from 'rxjs';
/**
 * To modify the labels and text displayed, create a new instance of MatSortHeaderIntl and
 * include it in a custom provider.
 * @deprecated No longer being used. To be removed.
 * @breaking-change 13.0.0
 */
export declare class MatSortHeaderIntl {
    /**
     * Stream that emits whenever the labels here are changed. Use this to notify
     * components if the labels have changed after initialization.
     */
    readonly changes: Subject<void>;
}
/** @docs-private */
export declare function MAT_SORT_HEADER_INTL_PROVIDER_FACTORY(parentIntl: MatSortHeaderIntl): MatSortHeaderIntl;
/** @docs-private */
export declare const MAT_SORT_HEADER_INTL_PROVIDER: {
    provide: typeof MatSortHeaderIntl;
    deps: Optional[][];
    useFactory: typeof MAT_SORT_HEADER_INTL_PROVIDER_FACTORY;
};
