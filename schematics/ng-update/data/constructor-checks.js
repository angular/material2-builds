"use strict";
/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.constructorChecks = void 0;
const schematics_1 = require("@angular/cdk/schematics");
/**
 * List of class names for which the constructor signature has been changed. The new constructor
 * signature types don't need to be stored here because the signature will be determined
 * automatically through type checking.
 */
exports.constructorChecks = {
    [schematics_1.TargetVersion.V10]: [
        {
            pr: 'https://github.com/angular/components/pull/19307',
            changes: ['MatSlideToggle']
        },
        {
            pr: 'https://github.com/angular/components/pull/19379',
            changes: ['MatSlider']
        },
        {
            pr: 'https://github.com/angular/components/pull/19372',
            changes: ['MatSortHeader']
        }
    ],
    [schematics_1.TargetVersion.V9]: [
        {
            pr: 'https://github.com/angular/components/pull/17230',
            changes: ['MatSelect']
        },
        {
            pr: 'https://github.com/angular/components/pull/17333',
            changes: ['MatDialogRef']
        }
    ],
    [schematics_1.TargetVersion.V8]: [
        {
            pr: 'https://github.com/angular/components/pull/15647',
            changes: ['MatFormField', 'MatTabLink', 'MatVerticalStepper']
        },
        { pr: 'https://github.com/angular/components/pull/15757', changes: ['MatBadge'] },
        { pr: 'https://github.com/angular/components/issues/15734', changes: ['MatButton', 'MatAnchor'] },
        {
            pr: 'https://github.com/angular/components/pull/15761',
            changes: ['MatSpinner', 'MatProgressSpinner']
        },
        { pr: 'https://github.com/angular/components/pull/15723', changes: ['MatList', 'MatListItem'] },
        { pr: 'https://github.com/angular/components/pull/15722', changes: ['MatExpansionPanel'] }, {
            pr: 'https://github.com/angular/components/pull/15737',
            changes: ['MatTabHeader', 'MatTabBody']
        },
        { pr: 'https://github.com/angular/components/pull/15806', changes: ['MatSlideToggle'] },
        { pr: 'https://github.com/angular/components/pull/15773', changes: ['MatDrawerContainer'] }
    ],
    [schematics_1.TargetVersion.V7]: [
        {
            pr: 'https://github.com/angular/components/pull/11706',
            changes: ['MatDrawerContent'],
        },
        { pr: 'https://github.com/angular/components/pull/11706', changes: ['MatSidenavContent'] }
    ],
    [schematics_1.TargetVersion.V6]: [
        {
            pr: 'https://github.com/angular/components/pull/9190',
            changes: ['NativeDateAdapter'],
        },
        {
            pr: 'https://github.com/angular/components/pull/10319',
            changes: ['MatAutocomplete'],
        },
        {
            pr: 'https://github.com/angular/components/pull/10344',
            changes: ['MatTooltip'],
        },
        {
            pr: 'https://github.com/angular/components/pull/10389',
            changes: ['MatIconRegistry'],
        },
        {
            pr: 'https://github.com/angular/components/pull/9775',
            changes: ['MatCalendar'],
        },
    ]
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc3RydWN0b3ItY2hlY2tzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL3NjaGVtYXRpY3MvbmctdXBkYXRlL2RhdGEvY29uc3RydWN0b3ItY2hlY2tzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQTs7Ozs7O0dBTUc7OztBQUVILHdEQUFvRztBQUVwRzs7OztHQUlHO0FBQ1UsUUFBQSxpQkFBaUIsR0FBaUQ7SUFDN0UsQ0FBQywwQkFBYSxDQUFDLEdBQUcsQ0FBQyxFQUFFO1FBQ25CO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQztTQUM1QjtRQUNEO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxXQUFXLENBQUM7U0FDdkI7UUFDRDtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUMsZUFBZSxDQUFDO1NBQzNCO0tBQ0Y7SUFDRCxDQUFDLDBCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbEI7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDLFdBQVcsQ0FBQztTQUN2QjtRQUNEO1lBQ0UsRUFBRSxFQUFFLGtEQUFrRDtZQUN0RCxPQUFPLEVBQUUsQ0FBQyxjQUFjLENBQUM7U0FDMUI7S0FDRjtJQUNELENBQUMsMEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNsQjtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUMsY0FBYyxFQUFFLFlBQVksRUFBRSxvQkFBb0IsQ0FBQztTQUM5RDtRQUNELEVBQUMsRUFBRSxFQUFFLGtEQUFrRCxFQUFFLE9BQU8sRUFBRSxDQUFDLFVBQVUsQ0FBQyxFQUFDO1FBQy9FLEVBQUMsRUFBRSxFQUFFLG9EQUFvRCxFQUFFLE9BQU8sRUFBRSxDQUFDLFdBQVcsRUFBRSxXQUFXLENBQUMsRUFBQztRQUMvRjtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUMsWUFBWSxFQUFFLG9CQUFvQixDQUFDO1NBQzlDO1FBQ0QsRUFBQyxFQUFFLEVBQUUsa0RBQWtELEVBQUUsT0FBTyxFQUFFLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxFQUFDO1FBQzdGLEVBQUMsRUFBRSxFQUFFLGtEQUFrRCxFQUFFLE9BQU8sRUFBRSxDQUFDLG1CQUFtQixDQUFDLEVBQUMsRUFBRTtZQUN4RixFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDLGNBQWMsRUFBRSxZQUFZLENBQUM7U0FDeEM7UUFDRCxFQUFDLEVBQUUsRUFBRSxrREFBa0QsRUFBRSxPQUFPLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxFQUFDO1FBQ3JGLEVBQUMsRUFBRSxFQUFFLGtEQUFrRCxFQUFFLE9BQU8sRUFBRSxDQUFDLG9CQUFvQixDQUFDLEVBQUM7S0FDMUY7SUFFRCxDQUFDLDBCQUFhLENBQUMsRUFBRSxDQUFDLEVBQUU7UUFDbEI7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDLGtCQUFrQixDQUFDO1NBQzlCO1FBQ0QsRUFBQyxFQUFFLEVBQUUsa0RBQWtELEVBQUUsT0FBTyxFQUFFLENBQUMsbUJBQW1CLENBQUMsRUFBQztLQUN6RjtJQUVELENBQUMsMEJBQWEsQ0FBQyxFQUFFLENBQUMsRUFBRTtRQUNsQjtZQUNFLEVBQUUsRUFBRSxpREFBaUQ7WUFDckQsT0FBTyxFQUFFLENBQUMsbUJBQW1CLENBQUM7U0FDL0I7UUFDRDtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUMsaUJBQWlCLENBQUM7U0FDN0I7UUFDRDtZQUNFLEVBQUUsRUFBRSxrREFBa0Q7WUFDdEQsT0FBTyxFQUFFLENBQUMsWUFBWSxDQUFDO1NBQ3hCO1FBQ0Q7WUFDRSxFQUFFLEVBQUUsa0RBQWtEO1lBQ3RELE9BQU8sRUFBRSxDQUFDLGlCQUFpQixDQUFDO1NBQzdCO1FBQ0Q7WUFDRSxFQUFFLEVBQUUsaURBQWlEO1lBQ3JELE9BQU8sRUFBRSxDQUFDLGFBQWEsQ0FBQztTQUN6QjtLQUNGO0NBQ0YsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2VcbiAqIENvcHlyaWdodCBHb29nbGUgTExDIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogVXNlIG9mIHRoaXMgc291cmNlIGNvZGUgaXMgZ292ZXJuZWQgYnkgYW4gTUlULXN0eWxlIGxpY2Vuc2UgdGhhdCBjYW4gYmVcbiAqIGZvdW5kIGluIHRoZSBMSUNFTlNFIGZpbGUgYXQgaHR0cHM6Ly9hbmd1bGFyLmlvL2xpY2Vuc2VcbiAqL1xuXG5pbXBvcnQge0NvbnN0cnVjdG9yQ2hlY2tzVXBncmFkZURhdGEsIFRhcmdldFZlcnNpb24sIFZlcnNpb25DaGFuZ2VzfSBmcm9tICdAYW5ndWxhci9jZGsvc2NoZW1hdGljcyc7XG5cbi8qKlxuICogTGlzdCBvZiBjbGFzcyBuYW1lcyBmb3Igd2hpY2ggdGhlIGNvbnN0cnVjdG9yIHNpZ25hdHVyZSBoYXMgYmVlbiBjaGFuZ2VkLiBUaGUgbmV3IGNvbnN0cnVjdG9yXG4gKiBzaWduYXR1cmUgdHlwZXMgZG9uJ3QgbmVlZCB0byBiZSBzdG9yZWQgaGVyZSBiZWNhdXNlIHRoZSBzaWduYXR1cmUgd2lsbCBiZSBkZXRlcm1pbmVkXG4gKiBhdXRvbWF0aWNhbGx5IHRocm91Z2ggdHlwZSBjaGVja2luZy5cbiAqL1xuZXhwb3J0IGNvbnN0IGNvbnN0cnVjdG9yQ2hlY2tzOiBWZXJzaW9uQ2hhbmdlczxDb25zdHJ1Y3RvckNoZWNrc1VwZ3JhZGVEYXRhPiA9IHtcbiAgW1RhcmdldFZlcnNpb24uVjEwXTogW1xuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzE5MzA3JyxcbiAgICAgIGNoYW5nZXM6IFsnTWF0U2xpZGVUb2dnbGUnXVxuICAgIH0sXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTkzNzknLFxuICAgICAgY2hhbmdlczogWydNYXRTbGlkZXInXVxuICAgIH0sXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTkzNzInLFxuICAgICAgY2hhbmdlczogWydNYXRTb3J0SGVhZGVyJ11cbiAgICB9XG4gIF0sXG4gIFtUYXJnZXRWZXJzaW9uLlY5XTogW1xuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzE3MjMwJyxcbiAgICAgIGNoYW5nZXM6IFsnTWF0U2VsZWN0J11cbiAgICB9LFxuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzE3MzMzJyxcbiAgICAgIGNoYW5nZXM6IFsnTWF0RGlhbG9nUmVmJ11cbiAgICB9XG4gIF0sXG4gIFtUYXJnZXRWZXJzaW9uLlY4XTogW1xuICAgIHtcbiAgICAgIHByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzE1NjQ3JyxcbiAgICAgIGNoYW5nZXM6IFsnTWF0Rm9ybUZpZWxkJywgJ01hdFRhYkxpbmsnLCAnTWF0VmVydGljYWxTdGVwcGVyJ11cbiAgICB9LFxuICAgIHtwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xNTc1NycsIGNoYW5nZXM6IFsnTWF0QmFkZ2UnXX0sXG4gICAge3ByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9pc3N1ZXMvMTU3MzQnLCBjaGFuZ2VzOiBbJ01hdEJ1dHRvbicsICdNYXRBbmNob3InXX0sXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTU3NjEnLFxuICAgICAgY2hhbmdlczogWydNYXRTcGlubmVyJywgJ01hdFByb2dyZXNzU3Bpbm5lciddXG4gICAgfSxcbiAgICB7cHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTU3MjMnLCBjaGFuZ2VzOiBbJ01hdExpc3QnLCAnTWF0TGlzdEl0ZW0nXX0sXG4gICAge3ByOiAnaHR0cHM6Ly9naXRodWIuY29tL2FuZ3VsYXIvY29tcG9uZW50cy9wdWxsLzE1NzIyJywgY2hhbmdlczogWydNYXRFeHBhbnNpb25QYW5lbCddfSwge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTU3MzcnLFxuICAgICAgY2hhbmdlczogWydNYXRUYWJIZWFkZXInLCAnTWF0VGFiQm9keSddXG4gICAgfSxcbiAgICB7cHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTU4MDYnLCBjaGFuZ2VzOiBbJ01hdFNsaWRlVG9nZ2xlJ119LFxuICAgIHtwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xNTc3MycsIGNoYW5nZXM6IFsnTWF0RHJhd2VyQ29udGFpbmVyJ119XG4gIF0sXG5cbiAgW1RhcmdldFZlcnNpb24uVjddOiBbXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTE3MDYnLFxuICAgICAgY2hhbmdlczogWydNYXREcmF3ZXJDb250ZW50J10sXG4gICAgfSxcbiAgICB7cHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTE3MDYnLCBjaGFuZ2VzOiBbJ01hdFNpZGVuYXZDb250ZW50J119XG4gIF0sXG5cbiAgW1RhcmdldFZlcnNpb24uVjZdOiBbXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvOTE5MCcsXG4gICAgICBjaGFuZ2VzOiBbJ05hdGl2ZURhdGVBZGFwdGVyJ10sXG4gICAgfSxcbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDMxOScsXG4gICAgICBjaGFuZ2VzOiBbJ01hdEF1dG9jb21wbGV0ZSddLFxuICAgIH0sXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvMTAzNDQnLFxuICAgICAgY2hhbmdlczogWydNYXRUb29sdGlwJ10sXG4gICAgfSxcbiAgICB7XG4gICAgICBwcjogJ2h0dHBzOi8vZ2l0aHViLmNvbS9hbmd1bGFyL2NvbXBvbmVudHMvcHVsbC8xMDM4OScsXG4gICAgICBjaGFuZ2VzOiBbJ01hdEljb25SZWdpc3RyeSddLFxuICAgIH0sXG4gICAge1xuICAgICAgcHI6ICdodHRwczovL2dpdGh1Yi5jb20vYW5ndWxhci9jb21wb25lbnRzL3B1bGwvOTc3NScsXG4gICAgICBjaGFuZ2VzOiBbJ01hdENhbGVuZGFyJ10sXG4gICAgfSxcbiAgXVxufTtcbiJdfQ==