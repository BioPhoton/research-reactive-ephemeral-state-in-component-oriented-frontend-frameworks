import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ColdCompositionContainerComponent} from "./cold-composition.container.component";
import {ColdCompositionBadComponent} from "./cold-composition-bad.component";
import {ColdCompositionGoodComponent} from "./cold-composition-good.component";
import {FormsModule} from "@angular/forms";
import {MatButtonModule, MatExpansionModule, MatSlideToggleModule} from "@angular/material";

const DECLARATIONS = [ColdCompositionContainerComponent, ColdCompositionBadComponent, ColdCompositionGoodComponent];
const MATERIAL_MODULES = [MatButtonModule, MatSlideToggleModule, MatExpansionModule];
export const ROUTES = [{
    path: '',
    component: ColdCompositionContainerComponent
}];

@NgModule({
    declarations: [DECLARATIONS],
    imports: [
        CommonModule,
        FormsModule,
        MATERIAL_MODULES
    ],
    exports: [DECLARATIONS]
})
export class ColdCompositionModule {
}
