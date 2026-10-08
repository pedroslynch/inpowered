import { Route, Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/auth.guard';
import { Shell } from './pages/shell/shell';

/** Browser tab title of a page, e.g. "Sales · inPowered AI". */
function title(page: string): string {
  return `${page} · inPowered AI`;
}

/** A full-screen copy of an inpowered.ai page, bundled from frontend/inpowered-pages. */
function inpoweredPage(path: string, pageTitle: string, page: string, frameTitle: string): Route {
  return {
    path,
    title: title(pageTitle),
    loadComponent: () => import('./pages/inpowered-page/inpowered-page').then((m) => m.InpoweredPage),
    data: { page, frameTitle },
  };
}

export const routes: Routes = [
  // Public pages
  {
    path: '',
    pathMatch: 'full',
    title: 'inPowered AI · AI Decisioning for Outcomes',
    loadComponent: () => import('./pages/landing/landing').then((m) => m.Landing),
  },
  inpoweredPage('about', 'About inPowered', '/inpowered-about.html', 'About inPowered AI'),
  inpoweredPage('careers', 'Careers', '/inpowered-careers.html', 'Careers at inPowered AI'),
  {
    path: 'login',
    title: title('Sign in'),
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },

  // Signed-in pages, inside the shell (navbar + menu)
  {
    path: '',
    component: Shell,
    canActivate: [authGuard],
    children: [
      {
        path: 'home',
        title: title('Home'),
        loadComponent: () => import('./pages/home/home').then((m) => m.Home),
      },
      {
        path: 'sales',
        title: title('Sales'),
        loadComponent: () => import('./pages/sales/sales-list').then((m) => m.SalesList),
      },
      {
        path: 'sales/new',
        title: title('New sale'),
        loadComponent: () => import('./pages/sales/sale-form').then((m) => m.SaleForm),
      },
      {
        path: 'sales/:id/edit',
        title: title('Edit sale'),
        loadComponent: () => import('./pages/sales/sale-form').then((m) => m.SaleForm),
      },
    ],
  },
  { path: '**', redirectTo: '' },
];
