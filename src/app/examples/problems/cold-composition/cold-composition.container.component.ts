import {Component} from '@angular/core';

@Component({
    selector: 'cold-composition-container',
    template: `
        <h1>Cold Composition Problem</h1>
        <cold-composition-bad>
        </cold-composition-bad>
        <hr/>
        <cold-composition-good>
        </cold-composition-good>
    `
})
export class ColdCompositionContainerComponent {
}
