import { Injectable } from '@angular/core';
import { defer, map, Observable, switchMap, throwError, timer } from 'rxjs';

import { ReviewApi } from '../api/review-api';
import {
  ReviewApiError,
  type EngagementReviewDto,
  type EngagementSummaryDto,
  type SaveReviewRequestDto,
  type SaveReviewResultDto,
} from '../api/review-api.models';
import { MOCK_ENGAGEMENTS, type MockEngagement } from './mock-data';

const ENGAGEMENT_LIST_DELAY_MS = 250;
const UNKNOWN_ENGAGEMENT_DELAY_MS = 100;

/**
 * In-memory stand-in for the backend, driven entirely by `mock-data.ts`.
 *
 * It holds no state and uses no randomness: the same call always produces the
 * same result.
 */
@Injectable()
export class MockReviewApi extends ReviewApi {
  override getEngagements(): Observable<EngagementSummaryDto[]> {
    return defer(() =>
      respondWith(
        MOCK_ENGAGEMENTS.map((engagement) => engagement.summary),
        ENGAGEMENT_LIST_DELAY_MS,
      ),
    );
  }

  override getReview(engagementId: string): Observable<EngagementReviewDto> {
    return defer(() => {
      const engagement = find(engagementId);
      if (!engagement) {
        return failWith(unknownEngagement(engagementId), UNKNOWN_ENGAGEMENT_DELAY_MS);
      }

      if (engagement.loadFails) {
        return failWith(
          new ReviewApiError(
            'LOAD_FAILED',
            `The server could not produce a review for engagement ${engagementId}.`,
            engagementId,
          ),
          engagement.loadDelayMs,
        );
      }

      return respondWith(engagement.review, engagement.loadDelayMs);
    });
  }

  override saveReview(request: SaveReviewRequestDto): Observable<SaveReviewResultDto> {
    return defer(() => {
      const { engagementId } = request;
      const engagement = find(engagementId);
      if (!engagement) {
        return failWith(unknownEngagement(engagementId), UNKNOWN_ENGAGEMENT_DELAY_MS);
      }

      if (engagement.saveFails) {
        debugger;
        return failWith(
          new ReviewApiError(
            'SAVE_FAILED',
            `The server rejected the review decisions for engagement ${engagementId}.`,
            engagementId,
          ),
          engagement.saveDelayMs,
        );
      }

      const result: SaveReviewResultDto = {
        engagementId,
        revision: request.revision,
        savedAt: new Date().toISOString(),
      };
      return respondWith(result, engagement.saveDelayMs);
    });
  }
}

function find(engagementId: string): MockEngagement | undefined {
  return MOCK_ENGAGEMENTS.find((engagement) => engagement.summary.id === engagementId);
}

/** Emits a copy of `value` after `delayMs`, so callers never share fixture objects. */
function respondWith<T>(value: T, delayMs: number): Observable<T> {
  return timer(delayMs).pipe(map(() => structuredClone(value)));
}

/** Errors after `delayMs`. `delay()` cannot be used here: it does not delay errors. */
function failWith(error: ReviewApiError, delayMs: number): Observable<never> {
  return timer(delayMs).pipe(switchMap(() => throwError(() => error)));
}

function unknownEngagement(engagementId: string): ReviewApiError {
  return new ReviewApiError(
    'ENGAGEMENT_NOT_FOUND',
    `No engagement with id ${engagementId}.`,
    engagementId,
  );
}
