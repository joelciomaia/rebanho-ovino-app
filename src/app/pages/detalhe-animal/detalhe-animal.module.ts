import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DetalheAnimalPageRoutingModule } from './detalhe-animal-routing.module';
import { DetalheAnimalPage } from './detalhe-animal.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalheAnimalPageRoutingModule,
    DetalheAnimalPage
  ],
  declarations: []
})
export class DetalheAnimalPageModule {}