import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';

import { ReviewApi } from '../api/review-api';
import {
  ReviewApiError,
  type ChangeDto,
  type EngagementReviewDto,
  type EngagementSummaryDto,
  type SaveReviewRequestDto,
  type SaveReviewResultDto,
} from '../api/review-api.models';
import { ReviewStore } from './review.store';

function change(overrides: Partial<ChangeDto> & { id: string }): ChangeDto {
  return {
    version: 1,
    group: 'Group',
    title: overrides.id,
    description: '',
    oldValue: null,
    newValue: null,
    ...overrides,
  };
}

function review(engagementId: string, changes: ChangeDto[], revision = 1): EngagementReviewDto {
  return { engagementId, revision, generatedAt: '2026-01-01T00:00:00.000Z', changes };
}

class FakeReviewApi implements Partial<ReviewApi> {
  readonly getReviewCalls: { engagementId: string; subject: Subject<EngagementReviewDto> }[] = [];
  readonly saveReviewCalls: {
    request: SaveReviewRequestDto;
    subject: Subject<SaveReviewResultDto>;
  }[] = [];

  getEngagements(): Observable<EngagementSummaryDto[]> {
    throw new Error('not used in this spec');
  }

  getReview(engagementId: string): Observable<EngagementReviewDto> {
    const subject = new Subject<EngagementReviewDto>();
    this.getReviewCalls.push({ engagementId, subject });
    return subject;
  }

  saveReview(request: SaveReviewRequestDto): Observable<SaveReviewResultDto> {
    const subject = new Subject<SaveReviewResultDto>();
    this.saveReviewCalls.push({ request, subject });
    return subject;
  }

  callsFor(engagementId: string) {
    return this.getReviewCalls.filter((call) => call.engagementId === engagementId);
  }
}

describe('ReviewStore', () => {
  let fakeApi: FakeReviewApi;
  let store: ReviewStore;

  beforeEach(() => {
    fakeApi = new FakeReviewApi();
    TestBed.configureTestingModule({
      providers: [{ provide: ReviewApi, useValue: fakeApi }],
    });
    store = TestBed.inject(ReviewStore);
  });

  it('tracks decision transitions and progress counts', () => {
    store.ensureLoaded('ENG-1');
    fakeApi.getReviewCalls[0].subject.next(
      review('ENG-1', [change({ id: 'CHG-1' }), change({ id: 'CHG-2' })]),
    );

    expect(store.progress('ENG-1')).toEqual({ total: 2, decided: 0, accepted: 0, declined: 0 });

    store.setDecision('ENG-1', 'CHG-1', 'ACCEPTED');
    expect(store.progress('ENG-1')).toEqual({ total: 2, decided: 1, accepted: 1, declined: 0 });
    expect(store.state('ENG-1').dirty).toBe(true);

    store.setDecision('ENG-1', 'CHG-1', 'DECLINED');
    expect(store.progress('ENG-1')).toEqual({ total: 2, decided: 1, accepted: 0, declined: 1 });

    store.clearDecision('ENG-1', 'CHG-1');
    expect(store.progress('ENG-1')).toEqual({ total: 2, decided: 0, accepted: 0, declined: 0 });
  });

  it('discards a stale load response superseded by a retry', () => {
    store.ensureLoaded('ENG-1');
    const firstCall = fakeApi.getReviewCalls[0];

    store.reload('ENG-1');
    const secondCall = fakeApi.getReviewCalls[1];

    // The stale first request resolves after the retry.
    secondCall.subject.next(review('ENG-1', [change({ id: 'CHG-2' })]));
    firstCall.subject.next(review('ENG-1', [change({ id: 'CHG-1' })]));

    expect(store.state('ENG-1').review?.changes.map((c) => c.id)).toEqual(['CHG-2']);
  });

  it('keeps independent engagements from clobbering each other while loading', () => {
    store.ensureLoaded('SLOW');
    store.ensureLoaded('FAST');

    fakeApi.getReviewCalls
      .find((call) => call.engagementId === 'FAST')!
      .subject.next(review('FAST', [change({ id: 'F-1' })]));

    expect(store.state('FAST').status).toBe('loaded');
    expect(store.state('SLOW').status).toBe('loading');

    fakeApi.getReviewCalls
      .find((call) => call.engagementId === 'SLOW')!
      .subject.next(review('SLOW', [change({ id: 'S-1' })]));

    expect(store.state('SLOW').review?.changes.map((c) => c.id)).toEqual(['S-1']);
    expect(store.state('FAST').review?.changes.map((c) => c.id)).toEqual(['F-1']);
  });

  it('keeps dirty=true if a decision changes while a save is in flight', () => {
    store.ensureLoaded('ENG-1');
    fakeApi.getReviewCalls[0].subject.next(review('ENG-1', [change({ id: 'CHG-1' })]));
    store.setDecision('ENG-1', 'CHG-1', 'ACCEPTED');

    store.save('ENG-1');
    expect(store.state('ENG-1').saveStatus).toBe('saving');

    // Edit made after the save request was sent, before it resolves.
    store.setDecision('ENG-1', 'CHG-1', 'DECLINED');

    fakeApi.saveReviewCalls[0].subject.next({
      engagementId: 'ENG-1',
      revision: 1,
      savedAt: '2026-01-01T00:00:01.000Z',
    });

    const state = store.state('ENG-1');
    expect(state.saveStatus).toBe('saved');
    expect(state.dirty).toBe(true);
    expect(state.lastSavedAt).toBe('2026-01-01T00:00:01.000Z');
  });

  it('preserves local decisions and stays dirty when save fails, and allows retry', () => {
    store.ensureLoaded('ENG-1');
    fakeApi.getReviewCalls[0].subject.next(review('ENG-1', [change({ id: 'CHG-1' })]));
    store.setDecision('ENG-1', 'CHG-1', 'ACCEPTED');

    store.save('ENG-1');
    const error = new ReviewApiError('SAVE_FAILED', 'save failed', 'ENG-1');
    fakeApi.saveReviewCalls[0].subject.error(error);

    const state = store.state('ENG-1');
    expect(state.saveStatus).toBe('error');
    expect(state.dirty).toBe(true);
    expect(state.decisions.get('CHG-1')).toBe('ACCEPTED');

    store.save('ENG-1');
    expect(fakeApi.saveReviewCalls.length).toBe(2);
    expect(store.state('ENG-1').saveStatus).toBe('saving');
  });

  it('omits unreviewed changes from the save payload and echoes each change version', () => {
    store.ensureLoaded('ENG-1');
    fakeApi.getReviewCalls[0].subject.next(
      review(
        'ENG-1',
        [change({ id: 'CHG-1', version: 3 }), change({ id: 'CHG-2', version: 1 })],
        7,
      ),
    );
    store.setDecision('ENG-1', 'CHG-1', 'ACCEPTED');
    // CHG-2 stays Unreviewed.

    store.save('ENG-1');

    expect(fakeApi.saveReviewCalls[0].request).toEqual({
      engagementId: 'ENG-1',
      revision: 7,
      decisions: [{ changeId: 'CHG-1', changeVersion: 3, decision: 'ACCEPTED' }],
    });
  });
});
