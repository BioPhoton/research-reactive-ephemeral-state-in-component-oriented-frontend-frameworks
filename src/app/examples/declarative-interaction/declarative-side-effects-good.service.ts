import {OnDestroy} from '@angular/core';
import {ConnectableObservable, Observable, Subject, Subscription} from 'rxjs';
import {mergeAll, publishReplay} from 'rxjs/operators';


export class DeclarativeSideEffectsGoodService implements OnDestroy {
    private effectSubscription = new Subscription();
    private effectSubject = new Subject<Observable<{ [key: string]: number }>>();

    constructor() {
        this.effectSubscription = (this.effectSubject
            .pipe(
                // process observables of side-effects
                // process side-effect
                mergeAll(),
                publishReplay(1)
            ) as ConnectableObservable<any>)
            .connect();
    }

    ngOnDestroy(): void {
        this.effectSubscription.unsubscribe();
    }

    connectEffect(o) {
        this.effectSubject.next(o);
    }

}
