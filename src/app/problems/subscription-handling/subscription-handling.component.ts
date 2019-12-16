import {Component} from '@angular/core';
import {timer} from 'rxjs';
import {tap} from 'rxjs/operators';
import {SubscriptionHandlingService} from './subscription-handling.service';

@Component({
    selector: 'subscription-handling',
    template: `
       <h1>Subscription Handling</h1>
    `,
    providers: [SubscriptionHandlingService]
})
export class SubscriptionHandlingComponent {
    sideEffect$ = timer(0, 1000)
        .pipe(tap(console.log));

    constructor(private subHandles: SubscriptionHandlingService) {
        this.subHandles
            .subscribe(this.sideEffect$)
    }
}
