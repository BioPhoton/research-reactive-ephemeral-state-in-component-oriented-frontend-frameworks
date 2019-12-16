import {Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {scan, shareReplay, tap} from "rxjs/operators";

@Injectable()
export class SomeBadService implements OnDestroy {
    commands$ = new Subject();
    composedState$ = this.commands$
        .pipe(
            tap(v => console.log('compute state ', v)),
            scan((acc, i) => {
                return {sum : acc['sum'] + i['sum']};
            }, {sum: 0}),
            shareReplay({refCount: true, bufferSize: 1})
        );

    constructor() {

    }

    ngOnDestroy(): void {
        this.commands$.complete();
    }

}
