import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';

import { ReviewApi } from '../api/review-api';
import { MOCK_ENGAGEMENTS } from './mock-data';
import { MockReviewApi } from './mock-review-api';

/** Smoke tests for the supplied mock backend. */
describe('MockReviewApi', () => {
  function createApi(): ReviewApi {
    TestBed.configureTestingModule({
      providers: [{ provide: ReviewApi, useClass: MockReviewApi }],
    });
    return TestBed.inject(ReviewApi);
  }

  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('returns the engagement list', async () => {
    const engagements = await firstValueFrom(createApi().getEngagements());

    expect(engagements).toEqual(MOCK_ENGAGEMENTS.map((engagement) => engagement.summary));
  });

  it('returns a review for an engagement', async () => {
    const loadable = MOCK_ENGAGEMENTS.find((engagement) => !engagement.loadFails);
    if (!loadable) {
      throw new Error('The sample data contains no loadable engagement.');
    }

    const review = await firstValueFrom(createApi().getReview(loadable.summary.id));

    expect(review.engagementId).toBe(loadable.summary.id);
    expect(review.revision).toBeGreaterThan(0);
  });
});
