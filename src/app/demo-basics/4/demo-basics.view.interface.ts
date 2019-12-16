import {merge, Observable, Subject, timer} from "rxjs";
import {map, switchMap} from "rxjs/operators";
import {Injectable} from "@angular/core";
import {LocalState} from "@common";
import {DemoBasicsItem} from "../demo-basics-item.interface";
import {DemoBasicsBaseModel} from "./demo-basics.base-model.interface";

export interface DemoBasicsView {
    // All UI-Events or component EventBindings
    refreshClicks: Subject<Event>;
    listExpandedChanges: Subject<boolean>
    // Optional The base model as observable
    baseModel$: Observable<DemoBasicsBaseModel>;
    // Optional Derivations as observable
    // ....
}
