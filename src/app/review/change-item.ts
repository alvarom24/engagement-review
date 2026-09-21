import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { ChangeDto, ChangeValue, ReviewDecision } from '../api/review-api.models';
import { DecisionToggle } from './decision-toggle';

@Component({
  selector: 'app-change-item',
  imports: [DecisionToggle],
  templateUrl: './change-item.html',
  styleUrl: './change-item.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeItem {
  readonly change = input.required<ChangeDto>();
  readonly decision = input<ReviewDecision | undefined>(undefined);
  readonly decisionChange = output<ReviewDecision | undefined>();

  formatValue(value: ChangeValue): string {
    return value === null ? '—' : String(value);
  }
}
