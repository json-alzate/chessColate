import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';

import { CommonModule } from '@angular/common';

import * as fromComponents from './components/';


@NgModule({
  declarations: [
    ...fromComponents.COMPONENTS

  ],
  imports: [
    IonicModule,
    CommonModule
  ],
  exports: [
    ...fromComponents.ENTRY_COMPONENTS
  ]
})
export class SharedModule { }
