import {Component} from '@angular/core';
import {DeclarativeInteractionGoodService} from "./declarative-interaction-good.service";
import {Subject} from "rxjs";
import {map} from "rxjs/operators";

@Component({
    selector: 'declarative-interaction-good',
    template: `
        <p>Declarative Interaction</p>
        <pre>{{state$ | async | json}}</pre>
        <button mat-raised-button color="primary" (click)="update$.next(true)">
            Update State
        </button>
    `,
    providers: [DeclarativeInteractionGoodService]
})
export class DeclarativeInteractionGoodComponent {
    state$ = this.stateService.state$;
    update$ = new Subject();

    constructor(private stateService: DeclarativeInteractionGoodService) {
        this.stateService.connectSlice(this.update$
            .pipe(map(_ => ({count: ~~(Math.random() * 100)}))));
    }

}
