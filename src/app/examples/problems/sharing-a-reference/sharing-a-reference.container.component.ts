import {Component} from '@angular/core';
import {of, Subject} from 'rxjs';

@Component({
    selector: 'sharing-a-reference-container',
    template: `
        <p><b>formGroupModel$:</b></p>
        <pre>{{formGroupModel$ | async | json}}</pre>
        <hr/>
        <p><b>imperative version:</b></p>
        <pre>{{imp$ | async | json}}</pre>
        <sharing-a-reference-imp-display
                [formGroupModel]="formGroupModel$ | async"
                (formValueChange)="imp$.next($event)">
        </sharing-a-reference-imp-display>
        
        <hr/>
        
        <p><b>reactive bad version:</b></p>
        <pre>{{reactiveBad$ | async | json}}</pre>
        <sharing-a-reference-bad-display
                [formGroupModel]="formGroupModel$ | async"
                (formValueChange)="reactiveBad$.next($event)">
        </sharing-a-reference-bad-display>
        <hr/>
        <p><b>reactiveGood$:</b></p>
        <pre>{{reactiveGood$ | async | json}}</pre>
        <sharing-a-reference-good-display
                [formGroupModel]="formGroupModel$ | async"
                (formValueChange)="reactiveGood$.next($event)">
        </sharing-a-reference-good-display>
        <sharing-a-reference-basics-display></sharing-a-reference-basics-display>
    `
})
export class SharingAReferenceContainerComponent {

    imp$ = new Subject();
    reactiveBad$ = new Subject();
    reactiveGood$ = new Subject();

    formGroupModel$ = of({
        name: '',
        age: 0
    });


}
