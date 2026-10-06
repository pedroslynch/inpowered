import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';
import { Shell } from './pages/shell/shell';

export const routes: Routes = [
  {
    path: 'login',
    title: 'Sign in · inPowered AI',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'home' },
      {
        path: 'home',
        title: 'Home · inPowered AI',
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'sales',
        title: 'Sales · inPowered AI',
        loadComponent: () => import('./pages/sales/sales-list').then((m) => m.SalesList),
      },
      {
        path: 'sales/new',
        title: 'New sale · inPowered AI',
        loadComponent: () => import('./pages/sales/sale-form').then((m) => m.SaleForm),
      },
      {
        path: 'sales/:id/edit',
        title: 'Edit sale · inPowered AI',
        loadComponent: () => import('./pages/sales/sale-form').then((m) => m.SaleForm),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
