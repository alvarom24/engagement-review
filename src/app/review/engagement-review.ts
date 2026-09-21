import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';

import type { ChangeDto } from '../api/review-api.models';
import { ChangeGroup, type DecisionChangeEvent } from './change-group';
import { ReviewProgress } from './review-progress';
import { ReviewStore } from './review.store';

interface GroupedChanges {
  group: string;
  changes: ChangeDto[];
}

function groupChanges(changes: ChangeDto[]): GroupedChanges[] {
  const order: string[] = [];
  const byGroup = new Map<string, ChangeDto[]>();

  for (const change of changes) {
    if (!byGroup.has(change.group)) {
      byGroup.set(change.group, []);
      order.push(change.group);
    }
    byGroup.get(change.group)!.push(change);
  }

  return order.map((group) => ({ group, changes: byGroup.get(group)! }));
}

@Component({
  selector: 'app-engagement-review',
  imports: [ChangeGroup, ReviewProgress, DatePipe],
  templateUrl: './engagement-review.html',
  styleUrl: './engagement-review.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EngagementReview {
  private readonly reviewStore = inject(ReviewStore);

  readonly engagementId = input.required<string>();

  readonly state = computed(() => this.reviewStore.state(this.engagementId()));
  readonly progress = computed(() => this.reviewStore.progress(this.engagementId()));
  readonly groups = computed(() => groupChanges(this.state().review?.changes ?? []));

  constructor() {
    effect(() => this.reviewStore.ensureLoaded(this.engagementId()));
  }

  onDecisionChange(event: DecisionChangeEvent): void {
    const id = this.engagementId();
    if (event.decision === undefined) {
      this.reviewStore.clearDecision(id, event.changeId);
    } else {
      this.reviewStore.setDecision(id, event.changeId, event.decision);
    }
  }

  retry(): void {
    this.reviewStore.reload(this.engagementId());
  }

  save(): void {
    this.reviewStore.save(this.engagementId());
  }
}
