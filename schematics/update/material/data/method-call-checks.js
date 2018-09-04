"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("../../index");
exports.methodCallChecks = {
    [index_1.TargetVersion.V6]: [
        {
            pr: 'https://github.com/angular/material2/pull/9190',
            changes: [
                {
                    className: 'NativeDateAdapter',
                    method: 'constructor',
                    invalidArgCounts: [
                        {
                            count: 1,
                            message: '"g{{platform}}" is now required as a second argument'
                        }
                    ]
                }
            ]
        },
        {
            pr: 'https://github.com/angular/material2/pull/10319',
            changes: [
                {
                    className: 'MatAutocomplete',
                    method: 'constructor',
                    invalidArgCounts: [
                        {
                            count: 2,
                            message: '"g{{defaults}}" is now required as a third argument'
                        }
                    ]
                }
            ]
        },
        {
            pr: 'https://github.com/angular/material2/pull/10325',
            changes: [
                {
                    className: 'FocusMonitor',
                    method: 'monitor',
                    invalidArgCounts: [
                        {
                            count: 3,
                            message: 'The "r{{renderer}}" argument has been removed'
                        }
                    ]
                }
            ]
        },
        {
            pr: 'https://github.com/angular/material2/pull/10344',
            changes: [
                {
                    className: 'MatTooltip',
                    method: 'constructor',
                    invalidArgCounts: [
                        {
                            count: 11,
                            message: '"g{{_defaultOptions}}" is now required as a twelfth argument'
                        }
                    ]
                }
            ]
        },
        {
            pr: 'https://github.com/angular/material2/pull/10389',
            changes: [
                {
                    className: 'MatIconRegistry',
                    method: 'constructor',
                    invalidArgCounts: [
                        {
                            count: 2,
                            message: '"g{{document}}" is now required as a third argument'
                        }
                    ]
                }
            ]
        },
        {
            pr: 'https://github.com/angular/material2/pull/9775',
            changes: [
                {
                    className: 'MatCalendar',
                    method: 'constructor',
                    invalidArgCounts: [
                        {
                            count: 6,
                            message: '"r{{_elementRef}}" and "r{{_ngZone}}" arguments have been removed'
                        },
                        {
                            count: 7,
                            message: '"r{{_elementRef}}", "r{{_ngZone}}", and "r{{_dir}}" arguments have been ' +
                                'removed'
                        }
                    ]
                }
            ]
        }
    ]
};
//# sourceMappingURL=method-call-checks.js.map