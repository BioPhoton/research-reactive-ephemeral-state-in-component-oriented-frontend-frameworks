import {Component} from '@angular/core';
import {animationFrameScheduler, asapScheduler, asyncScheduler, queueScheduler, Subject} from 'rxjs';
import {map, observeOn, scan, startWith, switchMap, tap} from "rxjs/operators";
import {ReEntranceBadService} from "./re-entrance-bad.service";

@Component({
    selector: 're-entrance-bad',
    template: `
        <h1 (click)="t()">Re Entrance Bad</h1>
        <select (click)="schedulersChange$.next($event)">
            <option value="noScheduler">No Schedule Operator</option>
            <option value="queueScheduler">queueScheduler</option>
            <option value="asapScheduler">asapScheduler</option>
            <option value="asyncScheduler">asyncScheduler</option>
            <option value="animationFrameScheduler">animationFrameScheduler</option>
        </select>
        <button (click)="nextClick$.next()">Next</button>
        selection$: {{selection$ | async | json }};
        <ul>
            <li *ngFor="let log of logs">{{log}}</li>
        </ul>
    `,
    providers: [ReEntranceBadService]
})
export class ReEntranceBadComponent {
    logs = [];
    nextClick$ = new Subject<void>();
    schedulersChange$ = new Subject<Event>();

    source$ = this.reEntranceBadService.commands$;
    selection$ = this.schedulersChange$
            .pipe(
                map((event: any) => event.target.selectedOptions[0].value),
                startWith('noScheduler'),
                // setup scheduling
                switchMap((schedulerName) => {
                    const schedulers = {
                        noScheduler: '',
                        asyncScheduler,
                        queueScheduler,
                        asapScheduler,
                        animationFrameScheduler
                    };
                    this.log('Switch scheduler to ', schedulerName);
                    return schedulerName !== 'noScheduler' ?
                        this.source$.pipe(observeOn(schedulers[schedulerName])) :
                        this.source$;
                }),
                tap(x => { if (x < 5) {
                    this.source$.next(x + 1);
                } }),
                scan(this.accumulateArr, undefined)
            );

    constructor(public reEntranceBadService: ReEntranceBadService) {
        this.nextClick$.subscribe(_ => this.source$.next(1));
    }

    log(msg,  args?) {
        this.logs.push(msg + JSON.stringify(args));
    }

    accumulateObj(s, c) {
        return typeof s === 'object' ? {...s, [c]:c} : {[c]:c};
    }

    accumulateArr(s, c) {
        return typeof s === 'object' ? [...s,c] : [c];
    }

    t () {
       this.reEntranceBadService.commands$.next(1)
    }

}
