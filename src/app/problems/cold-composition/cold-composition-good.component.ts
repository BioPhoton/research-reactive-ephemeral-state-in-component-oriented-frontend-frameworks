import {Component} from '@angular/core';
import {SomeGoodService} from "./some-good.service";

@Component({
    selector: 'cold-composition-good',
    template: `
        <h1>Hot Composition</h1>
        <button mat-raised-button [color]="'primary'" (click)="updateState()">update state</button><br/>
        <mat-slide-toggle [(ngModel)]="isOpen">
            Show result
        </mat-slide-toggle>
        <code *ngIf="isOpen">
            someService.composedState$: {{someBadService.composedState$ | async | json}}
        </code>
    `,
    providers: [SomeGoodService]
})
export class ColdCompositionGoodComponent {
    isOpen = false;

    constructor(public someBadService: SomeGoodService) {

    }

    updateState() {
        this.someBadService.commands$.next({sum: 1})
    }

}
