import {Component} from '@angular/core';
import {Observable} from "rxjs";
import {BreakpointObserver, Breakpoints} from "@angular/cdk/layout";
import {map, shareReplay} from "rxjs/operators";


@Component({
  selector: 'my-app',
  template: `
  <mat-sidenav-container class="sidenav-container">
    <mat-sidenav #drawer class="sidenav" fixedInViewport
                 [attr.role]="(isHandset$ | async) ? 'dialog' : 'navigation'"
                 [mode]="(isHandset$ | async) ? 'over' : 'side'"
                 [opened]="(isHandset$ | async) === false">
        <mat-toolbar>Menu</mat-toolbar>
        <mat-nav-list>
            <a mat-list-item [routerLink]="['subscription-handling']">Subscription Handling</a>
            <a mat-list-item [routerLink]="['sharing-a-reference']">Sharing State and State Derivations</a>
            <a mat-list-item [routerLink]="['late-subscriber']">Late Subscriber</a>
            <a mat-list-item [routerLink]="['cold-composition']">Cold Composition</a>
            <a mat-list-item [routerLink]="['declarative-interaction']">Declarative Interaction</a>
            <a mat-list-item [routerLink]="['re-entrance']">Re-Entrance</a>

        </mat-nav-list>
    </mat-sidenav>
    <mat-sidenav-content height="100%">
        <mat-toolbar color="primary">
            <button
                    type="button"
                    aria-label="Toggle sidenav"
                    mat-icon-button
                    (click)="drawer.toggle()"
                    *ngIf="isHandset$ | async">
                <mat-icon aria-label="Side nav toggle icon">menu</mat-icon>
            </button>
            <span>Example Headline</span>
        </mat-toolbar>
        <div class="container">
            <router-outlet></router-outlet>
        </div>
    </mat-sidenav-content>
</mat-sidenav-container>
  `
})
export class AppComponent  {
isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
        .pipe(
            map(result => result.matches),
            shareReplay()
        );

    constructor(private breakpointObserver: BreakpointObserver){}
}
