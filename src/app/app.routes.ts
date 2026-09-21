import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'engagements/:engagementId',
    loadComponent: () =>
      import('./review/engagement-review').then((module) => module.EngagementReview),
  },
];
