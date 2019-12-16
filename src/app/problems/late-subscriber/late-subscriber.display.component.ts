import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Subject} from 'rxjs';

@Component({
    selector: 'late-subscriber-display',
    template: `
    <h2>Late Subscriber Child</h2>
    <p><b>child state$:</b></p>
    <pre>{{state$ | async | json}}</pre>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LateSubscriberDisplayComponent {


    state$ = new Subject();

    constructor() {
    }

    @Input()
    set state(value) {
        this.state$.next({value});
    }

}
