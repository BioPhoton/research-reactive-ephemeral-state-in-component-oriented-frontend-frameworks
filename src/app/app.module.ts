import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';

import { FormsModule } from '@angular/forms';
import {RouterModule} from '@angular/router';


import { AppComponent } from './app.component';
import { ExBaseModule, ROUTES as EX_BASSE_ROUTES } from './examples/ex-base/ex-base.module';

const ROUTES = [
  {
    path: '',
    redirectTo: 'ex-base',
    pathMatch: 'full'
  },
  {
    path: 'ex-base',
    children: EX_BASSE_ROUTES
  }
];

@NgModule({
  imports:      [ 
    BrowserModule, 
  BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    FormsModule,  RouterModule.forRoot(ROUTES),
    ExBaseModule 
    
    ],
  declarations: [ AppComponent ],
  bootstrap:    [ AppComponent ]
})
export class AppModule { }
