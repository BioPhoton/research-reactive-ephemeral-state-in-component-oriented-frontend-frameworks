import {Component} from '@angular/core';
import {SomeBadService} from "./some-bad.service";

@Component({
    selector: 'cold-composition-bad',
    template: `
        <h1>Cold Composition</h1>
        <button mat-raised-button color="primary" (click)="updateState()">update state</button><br/>
        <mat-slide-toggle [(ngModel)]="isOpen">
            Show result
        </mat-slide-toggle>
        <code *ngIf="isOpen">
            someService.composedState$: {{someBadService.composedState$ | async | json}}
        </code>
    `,
    providers: [SomeBadService]
})
export class ColdCompositionBadComponent {
    isOpen = false;

    constructor(public someBadService: SomeBadService) {

    }

    updateState() {
        this.someBadService.commands$.next({sum: 1})
    }

}
