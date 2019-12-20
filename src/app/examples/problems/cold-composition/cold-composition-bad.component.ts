import {Component} from '@angular/core';
import {SomeBadService} from "./some-bad.service";

@Component({
    selector: 'cold-composition-bad',
    template: `
        <h1>Cold Composition</h1>
        <button mat-raised-button color="primary" (click)="updateState()">update state</button><br/>
        <mat-expansion-panel [(expanded)]="isOpen">
            <mat-expansion-panel-header>
                <mat-panel-title>Cold Composition</mat-panel-title>
                <mat-panel-description>subscriber controls composition</mat-panel-description>
            </mat-expansion-panel-header>
            <ng-container *ngIf="isOpen">
                <code>someService.composedState$: {{someBadService.composedState$ | async | json}}</code>
            </ng-container>
        </mat-expansion-panel>
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
