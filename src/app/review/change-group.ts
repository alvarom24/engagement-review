import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import type { ChangeDto, ReviewDecision } from '../api/review-api.models';
import { ChangeItem } from './change-item';

export interface DecisionChangeEvent {
  changeId: string;
  decision: ReviewDecision | undefined;
}

@Component({
  selector: 'app-change-group',
  imports: [ChangeItem],
  templateUrl: './change-group.html',
  styleUrl: './change-group.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangeGroup {
  readonly group = input.required<string>();
  readonly changes = input.required<ChangeDto[]>();
  readonly decisions = input.required<Map<string, ReviewDecision>>();
  readonly decisionChange = output<DecisionChangeEvent>();
}
