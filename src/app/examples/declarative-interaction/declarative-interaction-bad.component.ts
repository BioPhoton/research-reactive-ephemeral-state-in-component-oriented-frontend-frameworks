import {Component} from '@angular/core';
import {DeclarativeInteractionBadService} from "./declarative-interaction-bad.service";

@Component({
    selector: 'declarative-interaction-bad',
    template: `
        <p>Imperative Interaction</p>
        <pre>{{state$ | async | json}}</pre>
        <button (click)="updateCount()">
            Update State
        </button>
    `,

    providers: [DeclarativeInteractionBadService]
})
export class DeclarativeInteractionBadComponent {
    state$ = this.stateService.state$;

    constructor(private stateService: DeclarativeInteractionBadService) {

    }

    updateCount() {
        this.stateService
            .dispatch(({count: ~~(Math.random() * 100)}));
    }

}
