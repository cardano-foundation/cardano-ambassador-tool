# Project Tasks

## Redux Migration Cleanup
- [x] Remove `treasuryPayouts` from `dataSlice` if unused (replaced by `treasurySlice`) - *Verified implementation uses dataSlice*
- [x] Remove `treasuryPayouts` from `store.ts` serialization checks.
- [x] Update `CLAUDE.md` to reflect Redux architecture and removal of `AppContext`.
- [x] Verify no stale `useContext` imports remain.

## Treasury Feature
- [x] Verify `totalPayouts` calculation logic coverage. - *Fixed to filter by 'paid_out' status*

## Auth Feature
- [x] Verify `hydrateFromSession` and role resolution flow. - *Verified implementation*

## Backend
- [x] Verify `counter-utxo` API route functionality. - *Verified implementation*

