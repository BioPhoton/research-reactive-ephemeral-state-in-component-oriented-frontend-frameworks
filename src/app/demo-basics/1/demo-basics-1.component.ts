import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Store} from "@ngrx/store";
import {RepositoryListItem} from "../../data-access/github";
import {Subject} from "rxjs";
import {DemoBasicsItem} from "../demo-basics-item.interface";
import {LocalState} from "../rx-ephemeral-state";

interface ComponentState {
    refreshInterval: number;
    list: DemoBasicsItem[];
    listExpanded: boolean;
}

// The  initial state is normally derived form somewhere else automatically. But could also get specified statically here.
const initComponentState = {
    refreshInterval: 10000,
    listExpanded: false,
    list: []
};

@Component({
    selector: 'demo-basics-1',
    template: `
        <h3>Demo Basic 1 - mutating the state</h3>
        <!-- CC Dominic Elm and his template streams :) -->
        <mat-expansion-panel
                (expandedChange)="listExpandedChanges.next($event)"
                [expanded]="m.listExpanded">

            <mat-expansion-panel-header>
                <mat-panel-title>
                    User Name
                </mat-panel-title>
                <mat-panel-description>
                    <span *ngIf="!m.listExpanded">{{m.list.length}} Items | refreshInterval: {{_refreshInterval}}
                        ms</span>
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
    changeDetection: ChangeDetectionStrategy.OnPush
})
// 1) implement LocalState Service => ComponentState
export class DemoBasicsComponent1 extends LocalState<ComponentState> {

    // UI interaction
    refreshClicks = new Subject<Event>();
    listExpandedChanges = new Subject<boolean>();

    // UI state
    // 1.1) derivation
    m = initComponentState;

    _refreshInterval: number;
    @Input()
    set refreshInterval(refreshInterval: number) {
        if (refreshInterval > 100) {
            this._refreshInterval = refreshInterval;
        }
    }

    constructor(private store: Store<any>) {
        super();
        // 2.1) Optional - set initial state
        // 2.2) Connect input bindings
        // 2.3) Connect state from child components ( listExpandedChanges => listExpanded )
        // 2.4) Connect Global state (selectRepositoryList -> parseListItems => list)
    }

    // Map RepositoryListItem to ListItem
    parseListItems(l: RepositoryListItem[]): DemoBasicsItem[] {
        return l.map(({id, name}) => ({id, name}))
    }

}
