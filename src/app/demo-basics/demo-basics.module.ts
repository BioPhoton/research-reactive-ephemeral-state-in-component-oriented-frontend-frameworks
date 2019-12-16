import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {
    MatBadgeModule,
    MatButtonModule,
    MatCardModule,
    MatExpansionModule,
    MatIconModule,
    MatListModule,
    MatProgressBarModule,
    MatProgressSpinnerModule
} from "@angular/material";
import {DemoBasicsComponent1} from "./list/1/demo-basics-1.component";
import {DemoBasicsComponent2} from "./list/2/demo-basics-2.component";
import {DemoBasicsComponent3} from "./list/3/demo-basics-3.component";
import {DemoBasics4Component} from "./list/4/demo-basics-4.component";
import {DemoBasicsContainerComponent} from "./demo-basics.container.component";
import {ListMVVMComponent} from "./list/5/list.component";

export const ROUTES = [
    {
        path: '',
        component: DemoBasicsContainerComponent
    }
];
const DECLARATIONS = [
    DemoBasicsContainerComponent,
    DemoBasicsComponent1,
    DemoBasicsComponent2,
    DemoBasicsComponent3,
    DemoBasics4Component,
    ListMVVMComponent
];
export const materialModules = [
    MatIconModule,
    MatListModule,
    MatCardModule,
    MatButtonModule,
    MatExpansionModule,
    MatBadgeModule,
    MatProgressSpinnerModule,
    MatProgressBarModule
];

@NgModule({
    declarations: [DECLARATIONS],
    imports: [
        CommonModule,
        materialModules
    ],
    exports: [DECLARATIONS]
})
export class DemoBasicsModule {
}
