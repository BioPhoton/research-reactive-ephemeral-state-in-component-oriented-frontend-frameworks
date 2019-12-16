import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {takeUntil} from 'rxjs/operators';

@Injectable()
export class SubscriptionHandlingService implements OnDestroy {

    onDestroy$ = new Subject<void>();

    subscribe(o): void {
        o.pipe(takeUntil(this.onDestroy$))
            .subscribe();
    }

    ngOnDestroy(): void {
        this.onDestroy$.next();
    }

}
