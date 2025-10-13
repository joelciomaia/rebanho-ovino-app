import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ListaAnimaisPageRoutingModule } from './lista-animais-routing.module';
import { ListaAnimaisPage } from './lista-animais.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaAnimaisPageRoutingModule,
    ListaAnimaisPage
  ],
  declarations: []
})
export class ListaAnimaisPageModule {}