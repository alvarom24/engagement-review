import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { ReviewDecision } from '../api/review-api.models';

@Component({
  selector: 'app-decision-toggle',
  templateUrl: './decision-toggle.html',
  styleUrl: './decision-toggle.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DecisionToggle {
  /** `undefined` means Unreviewed. */
  readonly decision = input<ReviewDecision | undefined>(undefined);
  readonly decisionChange = output<ReviewDecision | undefined>();

  select(decision: ReviewDecision): void {
    this.decisionChange.emit(this.decision() === decision ? undefined : decision);
  }
}
