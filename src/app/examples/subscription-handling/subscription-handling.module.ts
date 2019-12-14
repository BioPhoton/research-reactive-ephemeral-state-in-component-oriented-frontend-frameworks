import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {SubscriptionHandlingComponent} from "./subscription-handling.component";

export const ROUTES = [
  {
    path: '',
    component: SubscriptionHandlingComponent
  }
];
const DECLARATIONS = [
    SubscriptionHandlingComponent, SubscriptionHandlingComponent
];
@NgModule({
  declarations: [DECLARATIONS],
  imports: [
    CommonModule
  ],
  exports: [DECLARATIONS]
})
export class SubscriptionHandlingModule { }
