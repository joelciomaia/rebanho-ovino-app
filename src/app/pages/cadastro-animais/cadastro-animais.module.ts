import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { IonicModule } from '@ionic/angular';
import { CadastroAnimaisPageRoutingModule } from './cadastro-animais-routing.module';
import { CadastroAnimaisPage } from './cadastro-animais.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    CadastroAnimaisPageRoutingModule,
    CadastroAnimaisPage
  ],
  declarations: []
})
export class CadastroAnimaisPageModule {}