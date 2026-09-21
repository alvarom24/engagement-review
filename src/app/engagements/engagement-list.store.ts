import { Injectable, computed, inject, signal } from '@angular/core';

import { ReviewApi } from '../api/review-api';
import type { EngagementSummaryDto, ReviewApiError } from '../api/review-api.models';

export type EngagementListStatus = 'idle' | 'loading' | 'loaded' | 'error';

/**
 * Holds the engagement list for the running session.
 *
 * Fetched once on first use and re-fetched only on explicit `reload()` — the
 * list is small reference data, not something the app polls.
 */
@Injectable({ providedIn: 'root' })
export class EngagementListStore {
  private readonly reviewApi = inject(ReviewApi);

  private readonly _status = signal<EngagementListStatus>('idle');
  private readonly _engagements = signal<EngagementSummaryDto[]>([]);
  private readonly _error = signal<ReviewApiError | undefined>(undefined);

  /** Guards against a stale response from an earlier `reload()` overwriting a newer one. */
  private requestId = 0;

  readonly status = this._status.asReadonly();
  readonly engagements = this._engagements.asReadonly();
  readonly error = this._error.asReadonly();

  readonly isLoading = computed(() => this._status() === 'loading');

  /** Loads the engagement list if it hasn't been loaded yet. */
  ensureLoaded(): void {
    if (this._status() === 'idle' || this._status() === 'error') {
      this.reload();
    }
  }

  reload(): void {
    const requestId = ++this.requestId;
    this._status.set('loading');
    this._error.set(undefined);

    this.reviewApi.getEngagements().subscribe({
      next: (engagements) => {
        if (requestId !== this.requestId) {
          return;
        }
        this._engagements.set(engagements);
        this._status.set('loaded');
      },
      error: (error: ReviewApiError) => {
        if (requestId !== this.requestId) {
          return;
        }
        this._error.set(error);
        this._status.set('error');
      },
    });
  }
}
