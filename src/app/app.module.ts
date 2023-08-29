import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { IonicStorageModule } from '@ionic/storage-angular';


import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';

import { environment } from '../environments/environment';

import { SharedModule } from '@shared/shared.module';


/* @ngrx */
import { StoreModule } from '@ngrx/store';
import { appReducers } from '@redux/reducers/app.reducers';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { StoreRouterConnectingModule } from '@ngrx/router-store';
import { CustomRouterStateSerializer } from '@redux/states/router.state';

import * as fromEffects from '@redux/effects';
import * as fromGuards from '@guards/index';


import { TranslocoRootModule } from './transloco-root.module';


const PROVIDERS = [
  ...fromGuards.guards
];

let devImports = [
  StoreDevtoolsModule.instrument({
    maxAge: 25,
    logOnly: environment.production
  })
];

if (environment.production) {
  devImports = [];
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot(),
    AppRoutingModule,
    /* NGRX */
    StoreRouterConnectingModule.forRoot({
      serializer: CustomRouterStateSerializer
    }),
    StoreModule.forRoot(appReducers),
    ...devImports,
    EffectsModule.forRoot(fromEffects.EFFECTS),
    // SocketIoModule.forRoot(config),
    HttpClientModule,
    TranslocoRootModule,
    FormsModule,
    ReactiveFormsModule,
    SharedModule
  ],
  providers: [
    PROVIDERS,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
