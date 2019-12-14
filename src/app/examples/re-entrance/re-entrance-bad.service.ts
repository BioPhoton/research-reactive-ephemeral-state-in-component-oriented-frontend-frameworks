import {ChangeDetectorRef, Injectable, OnDestroy} from '@angular/core';
import {Subject} from 'rxjs';
import {scan} from "rxjs/operators";

@Injectable({
    providedIn: 'root'
})
export class ReEntranceBadService implements OnDestroy {
    commands$ = new Subject<any>();
    state$ = this.commands$
        .pipe(
            scan((acc, i) => {
                return {items : acc['items'].concat([i])};
            }, {items: []}),
            // tap(_ => {this.cd.detectChanges();})
        );

    constructor(private cd: ChangeDetectorRef) {

    }

    ngOnDestroy(): void {
        this.commands$.complete();
    }

}
