import {Component} from '@angular/core';
import {interval} from "rxjs";
import {map, tap} from "rxjs/operators";
import {DeclarativeSideEffectsGoodService} from "./declarative-side-effects-good.service";

@Component({
    selector: 'declarative-side-effects-good',
    template: `
        <p>Declarative SideEffects</p>
    `,
    providers: [DeclarativeSideEffectsGoodService]
})
export class DeclarativeSideEffectsGoodComponent {
    constructor(private stateService: DeclarativeSideEffectsGoodService) {
        this.stateService.connectEffect(interval(1000)
            .pipe(tap(_ => ({count: ~~(Math.random() * 100)}))));
    }

}
