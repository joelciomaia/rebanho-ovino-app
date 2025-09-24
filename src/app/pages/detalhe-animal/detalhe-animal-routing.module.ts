import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DetalheAnimalPage } from './detalhe-animal.page';

const routes: Routes = [
  {
    path: '',
    component: DetalheAnimalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalheAnimalPageRoutingModule {}