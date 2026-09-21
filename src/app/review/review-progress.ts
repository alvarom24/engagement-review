import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import type { ReviewProgress as ReviewProgressData } from './review.store';

@Component({
  selector: 'app-review-progress',
  templateUrl: './review-progress.html',
  styleUrl: './review-progress.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewProgress {
  readonly progress = input.required<ReviewProgressData>();

  readonly percentDecided = computed(() => {
    const { total, decided } = this.progress();
    return total === 0 ? 100 : Math.round((decided / total) * 100);
  });
}
