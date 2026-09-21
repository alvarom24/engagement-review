import { Observable } from 'rxjs';

import type {
  EngagementReviewDto,
  EngagementSummaryDto,
  SaveReviewRequestDto,
  SaveReviewResultDto,
} from './review-api.models';

/**
 * The API surface the application depends on.
 *
 * ```ts
 * private readonly reviewApi = inject(ReviewApi);
 * ```
 *
 * Any call may fail; errors arrive as `ReviewApiError`.
 */
export abstract class ReviewApi {
  /** Lists the engagements available to the current user. */
  abstract getEngagements(): Observable<EngagementSummaryDto[]>;

  /**
   * Loads the review for an engagement.
   *
   * Fails with `ENGAGEMENT_NOT_FOUND` for an unknown id, or `LOAD_FAILED` when
   * the server cannot produce the review.
   */
  abstract getReview(engagementId: string): Observable<EngagementReviewDto>;

  /**
   * Records decisions for an engagement.
   *
   * Fails with `ENGAGEMENT_NOT_FOUND` for an unknown id, or `SAVE_FAILED` when
   * the server rejects the write.
   */
  abstract saveReview(request: SaveReviewRequestDto): Observable<SaveReviewResultDto>;
}
