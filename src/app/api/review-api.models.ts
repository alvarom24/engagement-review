/**
 * Data transfer objects for the engagement review API.
 *
 * These types are the backend contract: they describe what the server sends
 * and accepts.
 */

/** Processing state of an engagement, as reported by the engagement list. */
export type EngagementStatus = 'READY' | 'PROCESSING' | 'ERROR';

/**
 * A decision on a single change.
 *
 * There is no third value: a change with no decision is simply absent from the
 * decisions sent to the server.
 */
export type ReviewDecision = 'ACCEPTED' | 'DECLINED';

/** The value a change moves from or to. `null` means there is no value. */
export type ChangeValue = string | number | null;

export interface EngagementSummaryDto {
  id: string;
  name: string;
  clientName: string;
  pendingChangeCount: number;
  status: EngagementStatus;
}

export interface EngagementReviewDto {
  engagementId: string;
  /**
   * The server revision this payload came from. Echo it back in
   * `SaveReviewRequestDto.revision` when saving decisions.
   */
  revision: number;
  /** ISO-8601 timestamp of when the server produced this payload. */
  generatedAt: string;
  changes: ChangeDto[];
}

export interface ChangeDto {
  /** Stable identity of the change. */
  id: string;
  /**
   * Content version of this change. Echo it back in
   * `ReviewDecisionDto.changeVersion` when recording a decision.
   */
  version: number;
  /** The server's categorisation of the change. Free text, not a fixed set. */
  group: string;
  title: string;
  description: string;
  oldValue: ChangeValue;
  newValue: ChangeValue;
}

export interface ReviewDecisionDto {
  changeId: string;
  changeVersion: number;
  decision: ReviewDecision;
}

export interface SaveReviewRequestDto {
  engagementId: string;
  /** The `revision` of the `EngagementReviewDto` the decisions were made against. */
  revision: number;
  decisions: ReviewDecisionDto[];
}

export interface SaveReviewResultDto {
  engagementId: string;
  revision: number;
  /** ISO-8601 timestamp of when the server recorded the decisions. */
  savedAt: string;
}

/** Machine-readable reason an API call failed. */
export type ReviewApiErrorCode = 'ENGAGEMENT_NOT_FOUND' | 'LOAD_FAILED' | 'SAVE_FAILED';

/**
 * Error delivered on the error channel of a `ReviewApi` call.
 *
 * `code` is stable and safe to branch on; `message` is for humans only.
 */
export class ReviewApiError extends Error {
  constructor(
    readonly code: ReviewApiErrorCode,
    message: string,
    readonly engagementId?: string,
  ) {
    super(message);
    this.name = 'ReviewApiError';
  }
}
