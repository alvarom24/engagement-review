import { TestBed } from '@angular/core/testing';

import { ReviewApi } from './api/review-api';
import { App } from './app';
import { appConfig } from './app.config';
import { MockReviewApi } from './mock/mock-review-api';

describe('App', () => {
  beforeEach(() => {
    TestBed.resetTestingModule();
  });

  it('renders the application shell', async () => {
    TestBed.configureTestingModule({ imports: [App], providers: appConfig.providers });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();

    const host = fixture.nativeElement as HTMLElement;
    expect(host.querySelector('h1')?.textContent).toContain('Engagement review');
  });

  it('wires ReviewApi to the mock backend', () => {
    TestBed.configureTestingModule({ providers: appConfig.providers });

    expect(TestBed.inject(ReviewApi)).toBeInstanceOf(MockReviewApi);
  });
});
