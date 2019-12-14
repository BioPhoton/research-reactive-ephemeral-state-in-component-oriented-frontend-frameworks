import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SubscriptionHandlingComponent} from "./subscription-handling.component";
import {SubscriptionHandlingBadComponent} from "./subscription-handling-bad.component";

export const ROUTES = [
  {
    path: '',
    component: SubscriptionHandlingComponent
  }
];
const DECLARATIONS = [
    SubscriptionHandlingComponent, SubscriptionHandlingBadComponent
];
@NgModule({
  declarations: [DECLARATIONS],
  imports: [
    CommonModule
  ],
  exports: [DECLARATIONS]
})
export class SubscriptionHandlingModule { }
