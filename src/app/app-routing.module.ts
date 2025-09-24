import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'auth', //Redireciona para auth
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
  {
  path: 'manejos',
  loadChildren: () => import('./pages/manejos/manejos.module').then(m => m.ManejospageModule)
  },
  {
    path: 'detalhe-animal/:id',
    loadChildren: () => import('./pages/detalhe-animal/detalhe-animal.module').then(m => m.DetalheAnimalPageModule)
  },
  // Rota curinga para páginas não encontradas - DEVE SER SEMPRE A ÚLTIMA MEU CHAPA
  {
    path: '**',
    redirectTo: 'auth', // Redireciona para auth se rota não existir
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