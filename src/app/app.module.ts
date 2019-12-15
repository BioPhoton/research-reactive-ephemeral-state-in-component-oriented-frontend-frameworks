import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';

import {FormsModule} from '@angular/forms';
import {RouterModule} from '@angular/router';


import {AppComponent} from './app.component';

import {SubscriptionHandlingModule} from "./examples/subscription-handling/subscription-handling.module";
import {SharingAReferenceModule} from "./examples/sharing-a-reference/sharing-a-reference.module";
import {LateSubscriberModule} from "./examples/late-subscriber/late-subscriber.module";
import {ColdCompositionModule} from "./examples/cold-composition/cold-composition.module";
import {DeclarativeInteractionModule} from "./examples/declarative-interaction/declarative-interaction.module";

import {ROUTES} from "./app.routes";

@NgModule({
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        LayoutModule,
        MatToolbarModule,
        MatButtonModule,
        MatSidenavModule,
        MatIconModule,
        MatListModule,
        FormsModule,
        SubscriptionHandlingModule,
        SharingAReferenceModule,
        LateSubscriberModule,
        ColdCompositionModule,
        DeclarativeInteractionModule,
        RouterModule.forRoot(ROUTES)
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent]
})
export class AppModule {
}
