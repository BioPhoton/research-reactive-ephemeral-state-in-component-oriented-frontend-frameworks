import {Injectable, OnDestroy} from '@angular/core';
import {ConnectableObservable, Subject, Subscription} from 'rxjs';
import {publishReplay, scan, tap} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class SomeGoodService implements OnDestroy {
    commands$ = new Subject();
    serviceSubscription = new Subscription();
    composedState$ = this.commands$
        .pipe(
            tap(v => console.log('compute state ', v)),
            scan((acc, i) => {
                return {sum : acc['sum'] + i['sum']};
            }, {sum: 0}),
            publishReplay(1)
        ) as ConnectableObservable<any>;

    constructor() {
        this.serviceSubscription = this.composedState$.connect();
    }

    ngOnDestroy(): void {
        this.serviceSubscription.unsubscribe();
    }

}
