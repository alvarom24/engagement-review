# Submission Notes

## AI usage

- Where AI helped: initial architecture (store design, routing, component boundaries) and plan, writing the
  bulk of the components/tests.
- Where you reviewed, corrected, or would rewrite anything — be specific about anything you
  changed after generation, or would change now that you've read through it: I have verified using the browser, checking the behavior against mock data (every flow), debugging the code, actually the AI implementation is pretty solid, maybe in a real project will verify with client/stake holders about the design and also, with the team to follow repo practices or other matter in terms of technical composition.
- How you verified the generated code: generating tests and running them, debugging the code, and reviewing the actual flows against the provided mock data.

## Approximate time spent

The exercise took around 2 hours, time spent on defining, AI planning, execution, testing and debugging.

## What I'd do next with more time

- Add a component-level test for `EngagementReview`'s state-to-template wiring (loading/error/empty
  branches), beyond the store-level and `DecisionToggle` tests already included.
- Revisit the engagement list's session badge once there's a real product answer for what
  `pendingChangeCount` should do after a save (see `DECISIONS.md` #5) — right now it's
  intentionally left server-owned and unadjusted.
- Add an explicit "discard changes" affordance on the load-error retry path, in case a user wants
  to confirm they're abandoning local edits rather than have `reload()` silently do it (today it
  only matters when retrying a failed load, where there's nothing local to lose yet).

## Known risk / limitation

`ReviewStore.save()` guards against edits made _during_ a save (see `DECISIONS.md` #3), but does
not guard against two independent `save()` calls being triggered back-to-back for the same
engagement in a way that overlaps two in-flight requests — the current code returns early if
`saveStatus === 'saving'`, which the UI enforces by disabling the Save button, but that's a UI-level
guard, not a store-level one. A caller that bypassed the component (e.g. a future keyboard shortcut
or a second UI surface) could technically fire two overlapping saves.

**Next test I'd write for it:** a `ReviewStore` spec that calls `save()` twice in immediate
succession without waiting for the first to resolve, and asserts only one `saveReview()` request
was actually made to `ReviewApi` — turning the current UI-level guard into a store-level invariant
that's independently verified.
