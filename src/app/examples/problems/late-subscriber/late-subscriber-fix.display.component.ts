import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {ReplaySubject} from 'rxjs';

@Component({
    selector: 'late-subscriber-fix-display',
    template: `
    <h2>Late Subscriber Fix Child</h2>
    <p><b>child state$:</b></p>
    <pre>{{state$ | async | json}}</pre>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LateSubscriberFixDisplayComponent {


    state$ = new ReplaySubject(1);

    constructor() {
    }

    @Input()
    set state(value) {
        this.state$.next({value});
    }

}
