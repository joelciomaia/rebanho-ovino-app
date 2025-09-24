import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ManejospageRoutingModule } from './manejos-routing.module';
import { Manejospage } from './manejos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ManejospageRoutingModule,
    Manejospage
  ],
  declarations: []
})
export class ManejospageModule {}