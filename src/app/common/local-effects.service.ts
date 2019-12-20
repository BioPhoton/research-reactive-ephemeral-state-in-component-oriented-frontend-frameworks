import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, Observable, Subject, Subscription} from 'rxjs';
import {mergeAll, publishReplay} from 'rxjs/operators';

@Injectable()
export class LocalEffects implements OnDestroy {
    private subscription: Subscription;
    private effectSubject = new Subject<Observable<{ [key: string]: number }>>();
    constructor() {
        this.subscription = this.effectSubject
            .pipe(mergeAll()).subscribe();
    }
    connectEffect(o: Observable<any>): void {
        this.effectSubject.next(o);
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }
}
