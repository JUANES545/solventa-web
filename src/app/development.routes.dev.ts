import { Routes } from '@angular/router';

export const developmentRoutes: Routes = [
  {
    path: '__dev/scenarios',
    title: 'Solventa · Test scenarios',
    loadComponent: () =>
      import('./features/scenarios/scenario.page').then((module) => module.ScenarioPage),
  },
];
