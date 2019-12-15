import {Component} from '@angular/core';
import {DeclarativeInteractionGoodService} from "./declarative-interaction-good.service";
import {interval, Subject} from "rxjs";
import {map, tap} from "rxjs/operators";
import {DeclarativeInteractionBadService} from "./declarative-interaction-bad.service";

@Component({
    selector: 'declarative-interaction-good',
    template: `
        <p>Declarative Interaction</p>
        <pre>{{state$ | async | json}}</pre>
        <button (click)="update$.next(true)">
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
