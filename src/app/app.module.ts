import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {HttpClientModule} from '@angular/common/http';
import {RouterModule} from '@angular/router';
import {ReactiveFormsModule} from '@angular/forms';
import {StoreModule} from '@ngrx/store';
import {EffectsModule} from '@ngrx/effects';
import {ROUTES} from "./app.routes";
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {LayoutModule} from '@angular/cdk/layout';
import {MatToolbarModule} from '@angular/material/toolbar';
import {MatButtonModule} from '@angular/material/button';
import {MatSidenavModule} from '@angular/material/sidenav';
import {MatIconModule} from '@angular/material/icon';
import {MatListModule} from '@angular/material/list';
import {AppComponent} from "./app-component/app.component";
import {MatCardModule} from "@angular/material";
import {StoreDevtoolsModule} from '@ngrx/store-devtools';
import {environment} from '../environments/environment';
import {GithubModule} from "./data-access/github";
import {ExampleContainerComponent} from "./examples/examples.container.component";
import {ColdCompositionModule} from "./examples/problems/cold-composition/cold-composition.module";
import {LateSubscriberModule} from "./examples/problems/late-subscriber/late-subscriber.module";
import {SubscriptionHandlingModule} from "./examples/problems/subscription-handling/subscription-handling.module";
import {SharingAReferenceModule} from "./examples/problems/sharing-a-reference/sharing-a-reference.module";
import {DeclarativeInteractionModule} from "./examples/problems/declarative-interaction/declarative-interaction.module";
import {DemoBasicsModule} from "./examples/demo-basics/demo-basics.module";

export const materialModules = [
    BrowserAnimationsModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatCardModule
];

@NgModule({
    imports: [
        BrowserModule, HttpClientModule, ReactiveFormsModule,
        StoreModule.forRoot({}),
        EffectsModule.forRoot([]),
        StoreDevtoolsModule.instrument({maxAge: 25, logOnly: environment.production}),

        RouterModule.forRoot(ROUTES),
        materialModules,
        GithubModule,
        ColdCompositionModule,
        LateSubscriberModule,
        SubscriptionHandlingModule,
        SharingAReferenceModule,
        DeclarativeInteractionModule,
        DemoBasicsModule
    ],
    declarations: [AppComponent, ExampleContainerComponent],
    bootstrap: [AppComponent]
})
export class AppModule {


}
