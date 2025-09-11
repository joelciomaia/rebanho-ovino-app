import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AuthPageRoutingModule } from './auth-routing.module'; 
//import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AuthPage } from './auth.page'; 

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    AuthPageRoutingModule,
    //BrowserAnimationsModule,
    AuthPage //Foi nescessátio importar pois não deixava declarar Grrr
  ],
  declarations: []//Não funciona declarando AuthPage
})
export class AuthPageModule {}