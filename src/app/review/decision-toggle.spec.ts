import { TestBed } from '@angular/core/testing';

import { DecisionToggle } from './decision-toggle';

describe('DecisionToggle', () => {
  function render(decision?: 'ACCEPTED' | 'DECLINED') {
    const fixture = TestBed.createComponent(DecisionToggle);
    fixture.componentRef.setInput('decision', decision);
    fixture.detectChanges();
    return fixture;
  }

  function buttons(fixture: ReturnType<typeof render>) {
    return Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];
  }

  it('marks the active option to match the current decision', () => {
    const fixture = render('ACCEPTED');
    const [unreviewed, accept, decline] = buttons(fixture);

    expect(accept.classList).toContain('decision-toggle__option--active');
    expect(unreviewed.classList).not.toContain('decision-toggle__option--active');
    expect(decline.classList).not.toContain('decision-toggle__option--active');
  });

  it('emits the clicked decision', () => {
    const fixture = render(undefined);
    const emitted: (string | undefined)[] = [];
    fixture.componentInstance.decisionChange.subscribe((value) => emitted.push(value));

    const [, accept] = buttons(fixture);
    accept.click();

    expect(emitted).toEqual(['ACCEPTED']);
  });

  it('clicking the active option again emits Unreviewed', () => {
    const fixture = render('DECLINED');
    const emitted: (string | undefined)[] = [];
    fixture.componentInstance.decisionChange.subscribe((value) => emitted.push(value));

    const [, , decline] = buttons(fixture);
    decline.click();

    expect(emitted).toEqual([undefined]);
  });
});
