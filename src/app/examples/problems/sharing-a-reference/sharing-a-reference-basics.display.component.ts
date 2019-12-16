import {Component} from '@angular/core';
import {Observable, Subject} from 'rxjs';
import {map, shareReplay} from "rxjs/operators";

@Component({
    selector: 'sharing-a-reference-basics-display',
    template: `
        <h2>Sharing a reference Basics</h2>
    `
})
export class SharingAReferenceBasicsDisplayComponent {

    constructor() {
        const timeStampUni$ = new Observable((subscriber) => {
            console.log('create producer logic');
            const dataObject = new Date();
            subscriber.next(dataObject);
        });

        timeStampUni$
            .subscribe(d => console.log('date: ', d));
        timeStampUni$
            .subscribe(d => console.log('date: ', d));

        // ---

        const timeStampMulti$ = new Subject();
        timeStampMulti$
            .subscribe(d => console.log('date: ', d));
        timeStampMulti$
            .subscribe(d => console.log('date: ', d));

        console.log('create date object');
        const dataObject = new Date();
        timeStampMulti$.next(dataObject);

        // ---

        const timeStampSub$ = new Subject();
        const timeStampOpr$ = timeStampSub$.pipe(
            map((date: Date) => {
                console.log('date transformation', date);
                return date.getTime();
            })
        );

        timeStampOpr$
            .subscribe(d => console.log('date: ', d));
        timeStampOpr$
            .subscribe(d => console.log('date: ', d));

        console.log('create date object');
        const dataObject2 = new Date();
        timeStampSub$.next(dataObject2);

        // ---

        const timeStampSub1$ = new Subject();
        const timeStampOpr1$ = timeStampSub1$.pipe(
            map((date: Date) => {
                console.log('date transformation', date);
                return date.getTime();
            }),
            shareReplay({refCount: true, bufferSize: 1})
        );

        timeStampOpr1$
            .subscribe(d => console.log('date: ', d));
        timeStampOpr1$
            .subscribe(d => console.log('date: ', d));

        console.log('create date object');
        const dataObject3 = new Date();
        timeStampSub1$.next(dataObject3);

    }
}
