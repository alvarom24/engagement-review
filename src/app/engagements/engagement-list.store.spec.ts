import { TestBed } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';

import { ReviewApi } from '../api/review-api';
import type {
  EngagementReviewDto,
  EngagementSummaryDto,
  SaveReviewRequestDto,
  SaveReviewResultDto,
} from '../api/review-api.models';
import { EngagementListStore } from './engagement-list.store';

class FakeReviewApi implements Partial<ReviewApi> {
  readonly engagementsSubjects: Subject<EngagementSummaryDto[]>[] = [];

  getEngagements(): Observable<EngagementSummaryDto[]> {
    const subject = new Subject<EngagementSummaryDto[]>();
    this.engagementsSubjects.push(subject);
    return subject;
  }

  getReview(): Observable<EngagementReviewDto> {
    throw new Error('not used in this spec');
  }

  saveReview(): Observable<SaveReviewResultDto> {
    throw new Error('not used in this spec');
  }
}

function summary(id: string): EngagementSummaryDto {
  return { id, name: id, clientName: id, pendingChangeCount: 0, status: 'READY' };
}

describe('EngagementListStore', () => {
  let fakeApi: FakeReviewApi;
  let store: EngagementListStore;

  beforeEach(() => {
    fakeApi = new FakeReviewApi();
    TestBed.configureTestingModule({
      providers: [{ provide: ReviewApi, useValue: fakeApi }],
    });
    store = TestBed.inject(EngagementListStore);
  });

  it('starts idle and moves to loading then loaded', () => {
    expect(store.status()).toBe('idle');

    store.ensureLoaded();
    expect(store.status()).toBe('loading');

    fakeApi.engagementsSubjects[0].next([summary('ENG-1')]);
    fakeApi.engagementsSubjects[0].complete();

    expect(store.status()).toBe('loaded');
    expect(store.engagements()).toEqual([summary('ENG-1')]);
  });

  it('ignores a stale response from a superseded reload', () => {
    store.reload();
    store.reload();

    // The first (now-stale) request resolves after the second.
    fakeApi.engagementsSubjects[1].next([summary('ENG-2')]);
    fakeApi.engagementsSubjects[0].next([summary('ENG-1')]);

    expect(store.engagements()).toEqual([summary('ENG-2')]);
  });

  it('surfaces an error and allows retry', () => {
    store.ensureLoaded();
    fakeApi.engagementsSubjects[0].error(new Error('boom'));

    expect(store.status()).toBe('error');

    store.ensureLoaded();
    expect(store.status()).toBe('loading');
  });
});
