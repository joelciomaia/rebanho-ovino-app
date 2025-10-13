


import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaAnimaisPage } from './lista-animais.page';

const routes: Routes = [
  {
    path: '',
    component: ListaAnimaisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaAnimaisPageRoutingModule {}



