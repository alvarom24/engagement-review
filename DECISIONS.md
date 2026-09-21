# Decisions

## 1. Review state lives in a session-scoped store keyed by engagement id, not in the route component

`ReviewStore` (`src/app/review/review.store.ts`) holds a `Map<engagementId, EngagementReviewState>`.
The routed `EngagementReview` component reads and writes through it but owns none of the state
itself.

**Why:** the brief requires that moving between engagements never loses unsaved work. Tying that
guarantee to a component's lifecycle is fragile — Angular's default route reuse strategy can
recreate a routed component on some navigation patterns, and even when it doesn't, "the state
happens to survive because the component happens to survive" is not something you can point at.
Keying state by engagement id in a singleton service makes the guarantee explicit and independent
of how the view is structured.

**Alternative considered:** hold decisions as local component state (a signal on
`EngagementReview`), reset in a route resolver or `ngOnInit`. Simpler to write, but it would have
meant re-deriving "has this engagement been visited before, and what did the user do" from
whatever the component could recover on (re)creation — exactly the kind of implicit coupling that
makes "did we just lose work" hard to verify by reading the code.

## 2. Stale load responses are discarded with a per-engagement request counter, not `switchMap`

Each `getReview()` call captures a `loadRequestId` on the engagement's state entry before
subscribing; a response is only applied if that id still matches when it arrives
(`review.store.ts`, `beginLoad`/`applyIfCurrentLoad`).

**Why:** because state is already keyed per engagement, two *different* engagements loading
concurrently can never clobber each other — they're separate map entries. The only real hazard is
a *duplicate* request for the *same* engagement (a manual retry after a load error, for example).
A counter that's checked on arrival handles that without needing to cancel or resubscribe to the
mock API's observable, which the fixed `ReviewApi` surface doesn't need to support.

## 3. Editing stays enabled during a save; a generation counter decides whether the result still applies

`setDecision`/`clearDecision` bump an `editGeneration` counter. `save()` snapshots it as
`savedGeneration`; on success, `dirty` is cleared only if no edit happened since — otherwise the
save is still reported (an honest `lastSavedAt`), but the UI correctly keeps showing unsaved work.

**Why:** the alternative — disabling all decision controls while `saveStatus === 'saving'` — is
simpler and removes the race outright, but blocks the user for the save's full round trip (up to
~1.4s in the supplied fixtures) for no correctness benefit. Silently dropping a mid-flight edit's
"unsaved" status, on the other hand, is exactly the kind of thing the brief calls out as
unacceptable ("do not mislead the user about ... what work has actually been saved"). The
generation counter buys correctness without giving up responsiveness. If the simpler,
edit-blocking approach had been chosen instead, the store wouldn't need `editGeneration` at all,
but the save button/toggles would need `saveStatus === 'saving'` wired into every control's
disabled state rather than just the save button's.

## 4. Only decided changes are sent to `saveReview`

`buildDecisionDtos` in `review.store.ts` includes a `ReviewDecisionDto` only for changes with a
recorded decision; "Unreviewed" changes are simply absent from the payload.

**Why:** this directly matches the documented DTO semantics ("There is no third value: a change
with no decision is simply absent from the decisions sent to the server"). No alternative was
considered here — it's what the fixed contract specifies.

## 5. The engagement list's `pendingChangeCount` is never adjusted locally after a save

After a successful save, the list still shows whatever `getEngagements()` last returned; it is not
decremented locally to reflect newly-accepted/declined changes.

**Why:** the server owns that count, and the brief doesn't specify what it means after a partial
accept/decline (e.g. does declining a change still remove it from "pending"?). Guessing and
showing a number that might not match the server would risk being actively misleading — worse than
a count that's simply a session behind until the next `getEngagements()` refresh. The session-local
"X/Y reviewed" / "Unsaved changes" badge on the list (from `ReviewStore.progress()`/`dirty`) covers
the "does the user know what they've done" need without fabricating server state.
