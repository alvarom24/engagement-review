import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';

import { ReviewApi } from './api/review-api';
import { routes } from './app.routes';
import { MockReviewApi } from './mock/mock-review-api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding()),
    { provide: ReviewApi, useClass: MockReviewApi },
  ],
};
