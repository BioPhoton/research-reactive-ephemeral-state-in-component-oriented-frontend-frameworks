import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Store} from "@ngrx/store";
import {map, tap} from "rxjs/operators";
import {fetchRepositoryList, RepositoryListItem, selectRepositoryList} from "@data-access/github";
import {DemoBasicsViewModelService} from "./demo-basics.view-model.service";
import {DemoBasicsItem} from "../demo-basics-item.interface";

@Component({
    selector: 'demo-basics-4',
    templateUrl: './demo-basics-4.view.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DemoBasicsViewModelService]
})
export class DemoBasicsComponent4 {

    @Input()
    set refreshInterval(refreshInterval: number) {
        if (refreshInterval > 100) {
            this.vm.setState({refreshInterval});
        }
    }

    constructor(public vm: DemoBasicsViewModelService,
                private store: Store<any>) {
        this.vm.connectState('list',
            this.store.select(selectRepositoryList).pipe(map(this.parseListItems))
        );
        this.vm.connectEffect(this.vm.refreshListSideEffect$
            .pipe(tap(_ => this.store.dispatch(fetchRepositoryList({}))))
        );
    }

    // Map RepositoryListItem to ListItem
    parseListItems(l: RepositoryListItem[]): DemoBasicsItem[] {
        return l.map(({id, name}) => ({id, name}))
    }

}
