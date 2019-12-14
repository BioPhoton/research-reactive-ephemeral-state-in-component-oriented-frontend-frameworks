import {Component, OnDestroy} from '@angular/core';
import {Subject, timer} from 'rxjs';
import {takeUntil, tap} from 'rxjs/operators';

@Component({
    selector: 'subscription-handling-bad',
    template: `
   <h1>Subscription Handling</h1>
  `
})
export class SubscriptionHandlingBadComponent implements OnDestroy {
    onDestroy$ = new Subject();

    sideEffect$ = timer(0, 1000).pipe(tap(console.log));

    constructor() {
        this.sideEffect$
            .pipe(takeUntil(this.onDestroy$))
            .subscribe();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next(true);
    }
}
