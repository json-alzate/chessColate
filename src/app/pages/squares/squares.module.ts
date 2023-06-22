import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';
import { SharedModule } from '@shared/shared.module';


import { SquaresPageRoutingModule } from './squares-routing.module';

import { SquaresPage } from './squares.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SquaresPageRoutingModule,
    SharedModule
  ],
  declarations: [SquaresPage]
})
export class SquaresPageModule { }
