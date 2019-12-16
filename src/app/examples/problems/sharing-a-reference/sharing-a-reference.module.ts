import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReactiveFormsModule} from "@angular/forms";
import {SharingAReferenceBadDisplayComponent} from "./sharing-a-reference-bad.display.component";
import {SharingAReferenceGoodDisplayComponent} from "./sharing-a-reference-good.display.component";
import {SharingAReferenceContainerComponent} from "./sharing-a-reference.container.component";
import {SharingAReferenceImpDisplayComponent} from "./sharing-a-reference-imp.display.component";
import {SharingAReferenceBasicsDisplayComponent} from "./sharing-a-reference-basics.display.component";
import {MatFormFieldModule, MatInputModule} from "@angular/material";

export const ROUTES = [
    {
        path: '',
        component: SharingAReferenceContainerComponent
    }
];
const DECLARATIONS = [
    SharingAReferenceContainerComponent,
    SharingAReferenceBadDisplayComponent,
    SharingAReferenceGoodDisplayComponent,
    SharingAReferenceImpDisplayComponent,
    SharingAReferenceBasicsDisplayComponent
];

@NgModule({
    declarations: [DECLARATIONS],
    imports: [
        CommonModule,
        MatInputModule,
        MatFormFieldModule,
        ReactiveFormsModule
    ],
    exports: [DECLARATIONS]
})
export class SharingAReferenceModule {

}
