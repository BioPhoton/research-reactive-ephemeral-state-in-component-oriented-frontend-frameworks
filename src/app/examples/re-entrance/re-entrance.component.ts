import {Component} from '@angular/core';
import {map, tap} from 'rxjs/operators';
import {ReEntranceGoodService} from "./re-entrance-good.service";

@Component({
    selector: 're-entrance',
    template: `
        <h1 (click)="t()">Re Entrance Good</h1>
        list$: {{list$ | async | json}}
    `,
    providers: [ReEntranceGoodService]
})
export class ReEntranceComponent {
    list$ = this.reEntranceGoodService.state$.pipe(
        tap(s =>  {
            if(s.items.length < 5) {
                this.reEntranceGoodService.commands$.next(s.items[s.items.length-1]+1)
            }
        }),
        map(s => s.items)
    );

    constructor(public reEntranceGoodService: ReEntranceGoodService) {

    }
    t() {
        console.log('t')
    }
}
