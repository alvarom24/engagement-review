import { Injectable, inject, signal } from '@angular/core';

import { ReviewApi } from '../api/review-api';
import type {
  ChangeDto,
  EngagementReviewDto,
  ReviewApiError,
  ReviewDecision,
  ReviewDecisionDto,
} from '../api/review-api.models';

export type ReviewLoadStatus = 'idle' | 'loading' | 'loaded' | 'error';
export type ReviewSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export interface EngagementReviewState {
  status: ReviewLoadStatus;
  review?: EngagementReviewDto;
  error?: ReviewApiError;
  /** Local decisions, keyed by change id. A change absent here is Unreviewed. */
  decisions: Map<string, ReviewDecision>;
  saveStatus: ReviewSaveStatus;
  saveError?: ReviewApiError;
  /** ISO-8601 timestamp of the last successful save, if any. */
  lastSavedAt?: string;
  /** True when there are decisions not reflected in the last successful save. */
  dirty: boolean;
  /** Guards a stale `getReview()` response from overwriting a newer one. */
  loadRequestId: number;
  /** Bumped on every decision change; used to detect edits made during a save. */
  editGeneration: number;
}

export interface ReviewProgress {
  total: number;
  decided: number;
  accepted: number;
  declined: number;
}

function createInitialState(): EngagementReviewState {
  return {
    status: 'idle',
    decisions: new Map(),
    saveStatus: 'idle',
    dirty: false,
    loadRequestId: 0,
    editGeneration: 0,
  };
}

function buildDecisionDtos(
  changes: ChangeDto[],
  decisions: Map<string, ReviewDecision>,
): ReviewDecisionDto[] {
  const dtos: ReviewDecisionDto[] = [];
  for (const change of changes) {
    const decision = decisions.get(change.id);
    if (decision) {
      dtos.push({ changeId: change.id, changeVersion: change.version, decision });
    }
  }
  return dtos;
}

/**
 * Session-scoped review state, keyed by engagement id.
 *
 * Keeping state here rather than on the route component means switching
 * engagements — or Angular destroying/recreating the detail component on
 * navigation — never loses a decision: the map entry for an engagement is
 * untouched by anything happening to other entries or to the routed view.
 */
@Injectable({ providedIn: 'root' })
export class ReviewStore {
  private readonly reviewApi = inject(ReviewApi);

  private readonly _states = signal<Map<string, EngagementReviewState>>(new Map());

  /** Current state for an engagement; a never-loaded engagement reads as idle/empty. */
  state(engagementId: string): EngagementReviewState {
    return this._states().get(engagementId) ?? createInitialState();
  }

  progress(engagementId: string): ReviewProgress {
    const entry = this.state(engagementId);
    const changes = entry.review?.changes ?? [];
    let accepted = 0;
    let declined = 0;
    for (const change of changes) {
      const decision = entry.decisions.get(change.id);
      if (decision === 'ACCEPTED') accepted++;
      else if (decision === 'DECLINED') declined++;
    }
    return { total: changes.length, decided: accepted + declined, accepted, declined };
  }

  /** Loads the review the first time this engagement is opened; a no-op after that. */
  ensureLoaded(engagementId: string): void {
    if (!this._states().has(engagementId)) {
      this.loadReview(engagementId);
    }
  }

  /** Re-fetches the review, discarding any local decisions. Used to retry after a load error. */
  reload(engagementId: string): void {
    this.loadReview(engagementId);
  }

  setDecision(engagementId: string, changeId: string, decision: ReviewDecision): void {
    this.patchEntry(engagementId, (entry) => {
      const decisions = new Map(entry.decisions);
      decisions.set(changeId, decision);
      return { ...entry, decisions, dirty: true, editGeneration: entry.editGeneration + 1 };
    });
  }

  clearDecision(engagementId: string, changeId: string): void {
    this.patchEntry(engagementId, (entry) => {
      const decisions = new Map(entry.decisions);
      decisions.delete(changeId);
      return { ...entry, decisions, dirty: true, editGeneration: entry.editGeneration + 1 };
    });
  }

  save(engagementId: string): void {
    const entry = this.state(engagementId);
    if (!entry.review || entry.saveStatus === 'saving') {
      return;
    }

    const savedGeneration = entry.editGeneration;
    const request = {
      engagementId,
      revision: entry.review.revision,
      decisions: buildDecisionDtos(entry.review.changes, entry.decisions),
    };

    this.patchEntry(engagementId, (e) => ({ ...e, saveStatus: 'saving', saveError: undefined }));

    this.reviewApi.saveReview(request).subscribe({
      next: (result) => {
        this.patchEntry(engagementId, (e) => ({
          ...e,
          saveStatus: 'saved',
          lastSavedAt: result.savedAt,
          // An edit made after this save started means the snapshot we just
          // saved is already out of date — keep `dirty` true in that case.
          dirty: e.editGeneration !== savedGeneration,
        }));
      },
      error: (error: ReviewApiError) => {
        this.patchEntry(engagementId, (e) => ({ ...e, saveStatus: 'error', saveError: error }));
      },
    });
  }

  private loadReview(engagementId: string): void {
    const requestId = this.beginLoad(engagementId);

    this.reviewApi.getReview(engagementId).subscribe({
      next: (review) => {
        this.applyIfCurrentLoad(engagementId, requestId, (entry) => ({
          ...entry,
          status: 'loaded',
          review,
          error: undefined,
          decisions: new Map(),
          dirty: false,
          editGeneration: 0,
          saveStatus: 'idle',
          saveError: undefined,
          lastSavedAt: undefined,
        }));
      },
      error: (error: ReviewApiError) => {
        this.applyIfCurrentLoad(engagementId, requestId, (entry) => ({
          ...entry,
          status: 'error',
          error,
        }));
      },
    });
  }

  private beginLoad(engagementId: string): number {
    const map = new Map(this._states());
    const current = map.get(engagementId) ?? createInitialState();
    const requestId = current.loadRequestId + 1;
    map.set(engagementId, {
      ...current,
      status: 'loading',
      error: undefined,
      loadRequestId: requestId,
    });
    this._states.set(map);
    return requestId;
  }

  /** Applies `updater` only if no newer load for this engagement has started since. */
  private applyIfCurrentLoad(
    engagementId: string,
    requestId: number,
    updater: (entry: EngagementReviewState) => EngagementReviewState,
  ): void {
    const map = new Map(this._states());
    const current = map.get(engagementId);
    if (!current || current.loadRequestId !== requestId) {
      return;
    }
    map.set(engagementId, updater(current));
    this._states.set(map);
  }

  private patchEntry(
    engagementId: string,
    updater: (entry: EngagementReviewState) => EngagementReviewState,
  ): void {
    const map = new Map(this._states());
    const current = map.get(engagementId) ?? createInitialState();
    map.set(engagementId, updater(current));
    this._states.set(map);
  }
}
