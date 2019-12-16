import {ChangeDetectionStrategy, Component, Input} from '@angular/core';
import {Store} from "@ngrx/store";
import {tap} from "rxjs/operators";
import {fetchRepositoryList, RepositoryListItem} from "@data-access/github";
import {SimpleListItem} from "../../../architecture/interfaces";
import {DemoBasicsViewModelService} from "./demo-basics.view-model.service";

@Component({
    selector: 'demo-basics-4',
    templateUrl: './demo-basics-4.view.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DemoBasicsViewModelService]
})
export class DemoBasics4Component {


    @Input()
    set refreshInterval(refreshInterval: number) {
        if (refreshInterval > 100) {
            this.vm.setState({refreshInterval});
        }
    }

    constructor(public vm: DemoBasicsViewModelService,
                private store: Store<any>) {
        // Component Model - composed out of one or multiple sources
        this.vm.connectEffect(this.vm.refreshListSideEffect$
            .pipe(tap(_ => this.store.dispatch(fetchRepositoryList({}))))
        );
    }

    // Map RepositoryListItem to ListItem
    parseListItems(l: RepositoryListItem[]): SimpleListItem[] {
        return l.map(({id, name}) => ({id, name}))
    }

}
