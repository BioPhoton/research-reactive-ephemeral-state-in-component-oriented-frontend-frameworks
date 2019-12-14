import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ReEntranceContainerComponent} from "./re-entrance.container.component";
import {ReEntranceBadComponent} from "./re-entrance-bad.component";
import {ReEntranceComponent} from "./re-entrance.component";

const DECLARATIONS = [ReEntranceContainerComponent, ReEntranceBadComponent, ReEntranceComponent];
export const ROUTES = [{
  path: '',
  component: ReEntranceContainerComponent
}];
@NgModule({
  declarations: [ DECLARATIONS ],
  imports: [
    CommonModule
  ],
  exports: [ DECLARATIONS ]
})
export class ReEntranceModule { }
