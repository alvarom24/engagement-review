# Engagement Review — Starter Project

An Angular starter for the engagement review exercise: the backend boundary, sample data, and an
otherwise empty application shell. Your exercise brief describes what to build.

## Requirements

- Node.js 22.22.3+ or 24.15.0+ (see `.nvmrc`)
- npm 8+

## Running the project

```bash
npm install                 # install dependencies
npm start                   # dev server on http://localhost:4200
npm test                    # run the tests in watch mode
npm test -- --watch=false   # run the tests once
npm run build               # production build
```

Tests run on Vitest via the Angular CLI. Prettier is configured (`npx prettier --write .`);
formatting is not assessed.

## The domain

- **Engagement** — a piece of client work, e.g. a statutory audit for one client and one year.
- **Review** — the changes currently pending on an engagement.
- **Change** — one proposed modification, with a title, a description, and the values it moves
  from and to. Each change carries a `group` label, the server's own categorisation of it.
- **Decision** — a verdict on a single change: `'ACCEPTED'` or `'DECLINED'`.

## The API

Inject `ReviewApi`:

```ts
import { ReviewApi } from './api/review-api';

private readonly reviewApi = inject(ReviewApi);
```

| Method                    | Returns                              |
| ------------------------- | ------------------------------------ |
| `getEngagements()`        | `Observable<EngagementSummaryDto[]>` |
| `getReview(engagementId)` | `Observable<EngagementReviewDto>`    |
| `saveReview(request)`     | `Observable<SaveReviewResultDto>`    |

Calls are asynchronous, how long they take varies, and any of them can fail with a
`ReviewApiError`.

The DTOs in [`src/app/api/review-api.models.ts`](src/app/api/review-api.models.ts) are the fixed
backend contract; their field semantics are documented there. Build against them as documented.
Treat these DTOs and the `ReviewApi` surface as fixed for the exercise.

## The sample data

The supplied fixtures are representative examples rather than the complete set of possible data,
so rely on the API contract rather than on specific engagement IDs, change IDs, counts, ordering
or values.

The mock backend in `src/app/mock/` stands in for a real server. Please leave it as it is.

## What is yours

How the Angular application is put together is intentionally left to you: what components exist
and where the boundaries between them sit, how state is held, how asynchronous work and failures
are handled, and what you test. The starter takes no position on any of it. Add whatever you
need, and replace the placeholder shell and the global styles entirely.

Styling is minimal on purpose and is not assessed beyond the interface being usable.

## Layout

```text
src/
  app/
    api/
      review-api.ts              # the abstraction to inject
      review-api.models.ts       # DTOs and ReviewApiError
    mock/
      mock-review-api.ts         # mock backend
      mock-data.ts               # sample data
    app.ts / app.html / app.css  # placeholder shell
    app.config.ts                # providers
  styles.css                     # minimal global styles
```
