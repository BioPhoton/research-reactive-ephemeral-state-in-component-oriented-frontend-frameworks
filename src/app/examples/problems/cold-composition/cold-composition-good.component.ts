import {Component} from '@angular/core';
import {SomeGoodService} from "./some-good.service";

@Component({
    selector: 'cold-composition-good',
    template: `
        <h1>Hot Composition</h1>
        <button mat-raised-button [color]="'primary'" (click)="updateState()">update state</button><br/>
        <mat-expansion-panel [(expanded)]="isOpen">
            <mat-expansion-panel-header>
                <mat-panel-title>Hot Composition</mat-panel-title>
                <mat-panel-description>Source controls composition</mat-panel-description>
            </mat-expansion-panel-header>
            <ng-container *ngIf="isOpen">
                <code>someService.composedState$: {{someGoodService.composedState$ | async | json}}</code>
            </ng-container>
        </mat-expansion-panel>
    `,
    providers: [SomeGoodService]
})
export class ColdCompositionGoodComponent {
    isOpen = false;

    constructor(public someGoodService: SomeGoodService) {

    }

    updateState() {
        this.someGoodService.commands$.next({sum: 1})
    }

}
