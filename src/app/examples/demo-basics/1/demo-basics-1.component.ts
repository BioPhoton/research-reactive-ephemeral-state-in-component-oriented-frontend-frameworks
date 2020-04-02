import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Action, Store} from "@ngrx/store";
import {
    fetchRepositoryList,
    repositoryListFetchError,
    repositoryListFetchSuccess,
    RepositoryListItem,
    selectRepositoryList
} from "@data-access/github";
import {interval, merge, Observable, Subject} from "rxjs";
import {DemoBasicsItem} from "../demo-basics-item.interface";
import {LocalState} from "../rx-ephemeral-state";
import {Actions, ofType} from "@ngrx/effects";
import {map, switchMap, tap} from "rxjs/operators";

interface ComponentState {
    refreshInterval: number;
    list: DemoBasicsItem[];
    listExpanded: boolean;
    isLoading: boolean;
}

// The  initial state is normally derived form somewhere else automatically. But could also get specified statically here.
const initComponentState = {
    refreshInterval: 10000,
    listExpanded: false,
    isLoading: false,
    list: []
};

@Component({
    selector: 'demo-basics-1',
    template: `
        <h3>Demo Basic 1 - Setup and Retrieving State</h3>
        <!-- CC Dominic Elm and his template streams :) -->
        <mat-expansion-panel class="list"
                *ngIf="m$ | async as m"
                (expandedChange)="listExpandedChanges.next($event)"
                [expanded]="m.listExpanded">

            <mat-expansion-panel-header class="list">
                <mat-progress-bar *ngIf="m.isLoading" [mode]="'query'"></mat-progress-bar>
                <mat-panel-title>
                    List
                </mat-panel-title>
                <mat-panel-description>
                   <span *ngIf="!m.listExpanded">{{m.list.length}}
                       Repositories Updated every: {{m.refreshInterval}}
                       ms
                   </span>
                    <span *ngIf="m.listExpanded">{{m.list.length}}</span>
                </mat-panel-description>
            </mat-expansion-panel-header>

            <button mat-raised-button color="primary"
                    (click)="refreshClicks.next($event)">
                Refresh List
            </button>

            <div *ngIf="m.list.length; else noList">
                <mat-list>
                    <mat-list-item *ngFor="let item of m.list">
                        {{item.name}}
                    </mat-list-item>
                </mat-list>
            </div>

            <ng-template #noList>
                <mat-card>No list given!</mat-card>
            </ng-template>

        </mat-expansion-panel>
    `,
    styles: [`
        .list .mat-expansion-panel-header {
            position: relative;
        }

        .list .mat-expansion-panel-header mat-progress-bar {
            position: absolute;
            top: 0px;
            left: 0;
        }

        .list .mat-expansion-panel-content .mat-expansion-panel-body {
            padding-top: 10px;
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class DemoBasicsComponent1 extends LocalState<ComponentState> {

    // UI interaction
    refreshClicks = new Subject<Event>();
    listExpandedChanges = new Subject<boolean>();

    m$ = this.select();

    @Input()
    set refreshInterval(refreshInterval: number) {
        if (refreshInterval > 4000) {
            this.setState({refreshInterval});
        }
    }

    isLoading$ = this.actions$.pipe(
      ofType(fetchRepositoryList, repositoryListFetchSuccess, repositoryListFetchError),
      map((a: Action) => a.type === fetchRepositoryList.type)
    );

    refreshSideEffect$ = merge(
        this.select(map(s => s.refreshInterval))
            .pipe(switchMap(ms => interval(ms))),
        this.refreshClicks
    )
        .pipe(
            tap(_ => this.store.dispatch(fetchRepositoryList({})))
        );

    constructor(private store: Store<any>,
                private actions$: Actions) {
        super();

        this.setState(initComponentState);
        this.connectState(this.listExpandedChanges
            .pipe(map((listExpanded: boolean) => ({listExpanded: listExpanded}))));
        this.connectState('list', this.store.select(selectRepositoryList));
        this.connectState('isLoading', this.isLoading$);
        this.connectEffect(this.refreshSideEffect$);
    }

    // Map RepositoryListItem to ListItem
    parseListItems(l: RepositoryListItem[]): DemoBasicsItem[] {
        return l.map(({id, name}) => ({id, name}))
    }

    toIsPending(o: Observable<Action>): Observable<boolean> {
        return o.pipe(
            ofType(repositoryListFetchError, repositoryListFetchSuccess, fetchRepositoryList),
            map((a: Action) => a.type === fetchRepositoryList.type)
        );
    }

}
