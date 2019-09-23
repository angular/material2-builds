/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */
import { TextFieldModule } from '@angular/cdk/text-field';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ErrorStateMatcher } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTextareaAutosize } from './autosize';
import { MatInput } from './input';
var MatInputModule = /** @class */ (function () {
    function MatInputModule() {
    }
    MatInputModule.decorators = [
        { type: NgModule, args: [{
                    declarations: [MatInput, MatTextareaAutosize],
                    imports: [
                        CommonModule,
                        TextFieldModule,
                        MatFormFieldModule,
                    ],
                    exports: [
                        TextFieldModule,
                        // We re-export the `MatFormFieldModule` since `MatInput` will almost always
                        // be used together with `MatFormField`.
                        MatFormFieldModule,
                        MatInput,
                        MatTextareaAutosize,
                    ],
                    providers: [ErrorStateMatcher],
                },] }
    ];
    return MatInputModule;
}());
export { MatInputModule };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5wdXQtbW9kdWxlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vLi4vc3JjL21hdGVyaWFsL2lucHV0L2lucHV0LW1vZHVsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O0dBTUc7QUFFSCxPQUFPLEVBQUMsZUFBZSxFQUFDLE1BQU0seUJBQXlCLENBQUM7QUFDeEQsT0FBTyxFQUFDLFlBQVksRUFBQyxNQUFNLGlCQUFpQixDQUFDO0FBQzdDLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFDLGlCQUFpQixFQUFDLE1BQU0sd0JBQXdCLENBQUM7QUFDekQsT0FBTyxFQUFDLGtCQUFrQixFQUFDLE1BQU0sOEJBQThCLENBQUM7QUFDaEUsT0FBTyxFQUFDLG1CQUFtQixFQUFDLE1BQU0sWUFBWSxDQUFDO0FBQy9DLE9BQU8sRUFBQyxRQUFRLEVBQUMsTUFBTSxTQUFTLENBQUM7QUFHakM7SUFBQTtJQWlCNkIsQ0FBQzs7Z0JBakI3QixRQUFRLFNBQUM7b0JBQ1IsWUFBWSxFQUFFLENBQUMsUUFBUSxFQUFFLG1CQUFtQixDQUFDO29CQUM3QyxPQUFPLEVBQUU7d0JBQ1AsWUFBWTt3QkFDWixlQUFlO3dCQUNmLGtCQUFrQjtxQkFDbkI7b0JBQ0QsT0FBTyxFQUFFO3dCQUNQLGVBQWU7d0JBQ2YsNEVBQTRFO3dCQUM1RSx3Q0FBd0M7d0JBQ3hDLGtCQUFrQjt3QkFDbEIsUUFBUTt3QkFDUixtQkFBbUI7cUJBQ3BCO29CQUNELFNBQVMsRUFBRSxDQUFDLGlCQUFpQixDQUFDO2lCQUMvQjs7SUFDNEIscUJBQUM7Q0FBQSxBQWpCOUIsSUFpQjhCO1NBQWpCLGNBQWMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIEBsaWNlbnNlXG4gKiBDb3B5cmlnaHQgR29vZ2xlIExMQyBBbGwgUmlnaHRzIFJlc2VydmVkLlxuICpcbiAqIFVzZSBvZiB0aGlzIHNvdXJjZSBjb2RlIGlzIGdvdmVybmVkIGJ5IGFuIE1JVC1zdHlsZSBsaWNlbnNlIHRoYXQgY2FuIGJlXG4gKiBmb3VuZCBpbiB0aGUgTElDRU5TRSBmaWxlIGF0IGh0dHBzOi8vYW5ndWxhci5pby9saWNlbnNlXG4gKi9cblxuaW1wb3J0IHtUZXh0RmllbGRNb2R1bGV9IGZyb20gJ0Bhbmd1bGFyL2Nkay90ZXh0LWZpZWxkJztcbmltcG9ydCB7Q29tbW9uTW9kdWxlfSBmcm9tICdAYW5ndWxhci9jb21tb24nO1xuaW1wb3J0IHtOZ01vZHVsZX0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5pbXBvcnQge0Vycm9yU3RhdGVNYXRjaGVyfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9jb3JlJztcbmltcG9ydCB7TWF0Rm9ybUZpZWxkTW9kdWxlfSBmcm9tICdAYW5ndWxhci9tYXRlcmlhbC9mb3JtLWZpZWxkJztcbmltcG9ydCB7TWF0VGV4dGFyZWFBdXRvc2l6ZX0gZnJvbSAnLi9hdXRvc2l6ZSc7XG5pbXBvcnQge01hdElucHV0fSBmcm9tICcuL2lucHV0JztcblxuXG5ATmdNb2R1bGUoe1xuICBkZWNsYXJhdGlvbnM6IFtNYXRJbnB1dCwgTWF0VGV4dGFyZWFBdXRvc2l6ZV0sXG4gIGltcG9ydHM6IFtcbiAgICBDb21tb25Nb2R1bGUsXG4gICAgVGV4dEZpZWxkTW9kdWxlLFxuICAgIE1hdEZvcm1GaWVsZE1vZHVsZSxcbiAgXSxcbiAgZXhwb3J0czogW1xuICAgIFRleHRGaWVsZE1vZHVsZSxcbiAgICAvLyBXZSByZS1leHBvcnQgdGhlIGBNYXRGb3JtRmllbGRNb2R1bGVgIHNpbmNlIGBNYXRJbnB1dGAgd2lsbCBhbG1vc3QgYWx3YXlzXG4gICAgLy8gYmUgdXNlZCB0b2dldGhlciB3aXRoIGBNYXRGb3JtRmllbGRgLlxuICAgIE1hdEZvcm1GaWVsZE1vZHVsZSxcbiAgICBNYXRJbnB1dCxcbiAgICBNYXRUZXh0YXJlYUF1dG9zaXplLFxuICBdLFxuICBwcm92aWRlcnM6IFtFcnJvclN0YXRlTWF0Y2hlcl0sXG59KVxuZXhwb3J0IGNsYXNzIE1hdElucHV0TW9kdWxlIHt9XG4iXX0=