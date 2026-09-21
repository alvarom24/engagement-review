import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { ReviewStore } from '../review/review.store';
import { EngagementListStore } from './engagement-list.store';

@Component({
  selector: 'app-engagement-list',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './engagement-list.html',
  styleUrl: './engagement-list.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngagementList implements OnInit {
  protected readonly listStore = inject(EngagementListStore);
  protected readonly reviewStore = inject(ReviewStore);

  ngOnInit(): void {
    this.listStore.ensureLoaded();
  }

  reload(): void {
    this.listStore.reload();
  }

  /** Session-local review status badge; a summary-level `status`/`pendingChangeCount`
   *  reflects the server, this reflects what the user has done so far in-app. */
  sessionBadge(engagementId: string): string | undefined {
    const state = this.reviewStore.state(engagementId);
    if (state.status !== 'loaded') {
      return undefined;
    }
    if (state.dirty) {
      return 'Unsaved changes';
    }
    const progress = this.reviewStore.progress(engagementId);
    if (progress.total === 0) {
      return undefined;
    }
    return `${progress.decided}/${progress.total} reviewed`;
  }
}
