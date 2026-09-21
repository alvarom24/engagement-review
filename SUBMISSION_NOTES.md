# Submission Notes

## AI usage

I used AI heavily, under my supervision: I reviewed the plan before any code was written and checked
the results as they came in, rather than accepting output wholesale.

- **Where AI helped:** the initial architecture (store design, routing, component boundaries), the
  implementation plan, and writing the bulk of the components and tests.
- **Where I reviewed and evaluated its output:** I researched the AI's suggestions, such as using
  signals and a service-based store, to confirm they fit this problem (small, session-scoped,
  per-engagement state) better than adding a state-management library. I found the resulting
  implementation solid and did not need to rewrite it. In a real project I would also validate the
  design with the client and stakeholders, and align the code with the team's repo practices and
  technical conventions.
- **How I verified the generated code:** I ran it in the browser and checked every flow against the
  supplied mock data (loading, saving, retrieving, and the error cases), debugged the important
  flows, and generated and ran focused tests for the riskiest logic.

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

After a successful save, `ReviewStore` records `lastSavedAt` and clears `dirty`, but it does not
update the stored review's `revision` from the `SaveReviewResultDto`. The supplied mock echoes back
the revision it was sent, so this works here. A real backend that increments the revision on every
write would receive a stale `revision` on the next save from the same session, and could reject it.
I left it because the fixed contract and mock don't exercise it, and I didn't want to guess at
conflict semantics the brief doesn't specify.

**Next test I'd write for it:** a `ReviewStore` spec where `saveReview()` resolves with a higher
`revision`, then a second `save()` is made after another edit, asserting the second request carries
the new revision and not the one from the original load.
