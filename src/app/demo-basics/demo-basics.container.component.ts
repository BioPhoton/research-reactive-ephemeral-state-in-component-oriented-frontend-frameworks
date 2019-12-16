import {Component} from '@angular/core';
import {Subject} from "rxjs";
import {map} from "rxjs/operators";

@Component({
    selector: 'demo-basics-container',
    template: `
        <h1>Demo Basics Container</h1>
        <div>
            <label>refreshInterval: {{refreshInterval$ | async}}</label><br/>
            <input type="number" (input)="refreshIntervalInput$.next($event)"/>
        </div>
        
        <demo-basics-1 [refreshInterval]="refreshInterval$ | async">
        </demo-basics-1>
        <!--
          <demo-basics-2 [refreshInterval]="refreshInterval$ | async">
          </demo-basics-2>
          <demo-basics-3 [refreshInterval]="refreshInterval$ | async">
          </demo-basics-3>
          <demo-basics-4 [refreshInterval]="refreshInterval$ | async">
          </demo-basics-4>
        -->
    `
})
export class DemoBasicsContainerComponent {
    refreshIntervalInput$ = new Subject<Event>();
    refreshInterval$ = this.refreshIntervalInput$
        .pipe(map((e: any) => e.target.value));
}
