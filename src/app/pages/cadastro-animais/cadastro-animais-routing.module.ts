import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CadastroAnimaisPage } from './cadastro-animais.page';

const routes: Routes = [
  {
    path: '',
    component: CadastroAnimaisPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CadastroAnimaisPageRoutingModule {}