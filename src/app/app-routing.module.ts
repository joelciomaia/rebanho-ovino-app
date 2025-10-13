import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then(m => m.AuthPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/dashboard/dashboard.module').then(m => m.DashboardPageModule)
  },
  {
    path: 'cadastro-animais',
    loadChildren: () => import('./pages/cadastro-animais/cadastro-animais.module').then(m => m.CadastroAnimaisPageModule)
  },
  // ✅ ADICIONAR ESTA ROTA PARA EDIÇÃO
  {
    path: 'cadastro-animais/:id',
    loadChildren: () => import('./pages/cadastro-animais/cadastro-animais.module').then(m => m.CadastroAnimaisPageModule)
  },
  {
    path: 'manejos',
    loadChildren: () => import('./pages/manejos/manejos.module').then(m => m.ManejospageModule)
  },
  {
    path: 'detalhe-animal/:id',
    loadChildren: () => import('./pages/detalhe-animal/detalhe-animal.module').then(m => m.DetalheAnimalPageModule)
  },
  {
    path: 'lista-animais',
    loadChildren: () => import('./pages/lista-animais/lista-animais.module').then(m => m.ListaAnimaisPageModule)
  },
  {
    path: 'ajuda',
    loadChildren: () => import('./pages/ajuda/ajuda.module').then(m => m.AjudaPageModule)
  },
  {
    path: '**',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule {}