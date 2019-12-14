import { NgModule } from '@angular/core';

import { ExBaseContainerComponent } from './ex-base.container.component';
import { ExBaseExampleNameComponent } from './ex-base.example-name.component';


export const ROUTES = [
  {
    path: '',
    component: ExBaseContainerComponent
  }
];

@NgModule({
  imports: [],
  declarations: [ ExBaseContainerComponent, ExBaseExampleNameComponent ]
})
export class ExBaseModule { }
