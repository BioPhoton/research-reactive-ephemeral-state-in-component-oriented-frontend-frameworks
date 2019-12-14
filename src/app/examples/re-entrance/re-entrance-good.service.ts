import {Injectable, OnDestroy} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {scan} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ReEntranceGoodService implements OnDestroy {
    commands$ = new BehaviorSubject<any>(0);
    state$ = this.commands$
        .pipe(
            // observeOn(queueScheduler),
            scan((acc: any, i): any => {
                return {items: acc.items.concat([i])};
            }, {items: []})
        );

    constructor() {

    }

    ngOnDestroy(): void {
        this.commands$.complete();
    }

}
