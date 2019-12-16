import {Component} from '@angular/core';
import {interval, of, timer} from 'rxjs';
import {take, tap} from "rxjs/operators";

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
