import { CdkAccordion } from '@angular/cdk/accordion';
/** MatAccordion's display modes. */
export declare type MatAccordionDisplayMode = 'default' | 'flat';
/**
 * Directive for a Material Design Accordion.
 */
export declare class MatAccordion extends CdkAccordion {
    /** Whether the expansion indicator should be hidden. */
    hideToggle: boolean;
    private _hideToggle;
    /**
     * The display mode used for all expansion panels in the accordion. Currently two display
     * modes exist:
     *  default - a gutter-like spacing is placed around any expanded panel, placing the expanded
     *     panel at a different elevation from the rest of the accordion.
     *  flat - no spacing is placed around expanded panels, showing all panels at the same
     *     elevation.
     */
    displayMode: MatAccordionDisplayMode;
}
