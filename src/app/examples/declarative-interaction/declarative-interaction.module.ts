import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';

import {DeclarativeInteractionContainerComponent} from "./declarative-interaction.container.component";
import {DeclarativeInteractionGoodComponent} from "./declarative-interaction-good.component";
import {DeclarativeInteractionBadComponent} from "./declarative-interaction-bad.component";
import {DeclarativeSideEffectsGoodComponent} from "./declarative-side-effects-good.component";

export const ROUTES = [
    {
        path: '',
        component: DeclarativeInteractionContainerComponent
    }
];
const DECLARATIONS = [
    DeclarativeInteractionContainerComponent,
    DeclarativeInteractionGoodComponent,
    DeclarativeInteractionBadComponent,
    DeclarativeSideEffectsGoodComponent
];

@NgModule({
    declarations: [DECLARATIONS],
    imports: [
        CommonModule
    ],
    exports: [DECLARATIONS]
})
export class DeclarativeInteractionModule {

}
