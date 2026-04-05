# Implementation Plan: Transcript Save & Review

## Overview

Implement the transcript save and review feature entirely in the Next.js frontend. No backend changes. All persistence via localStorage. New components slot into the existing split-screen layout as a slide-up overlay on the worker (bottom) half.

## Tasks

- [x] 1. Add `SavedTranscript` type and install fast-check
  - Add `SavedTranscript` interface to `frontend/types/index.ts`
  - Run `npm install --save-dev fast-check` in `frontend/`
  - _Requirements: 1.1, 1.4, 5.4_

- [x] 2. Implement `transcriptStore` utility
  - [x] 2.1 Create `frontend/lib/transcriptStore.ts`
    - Implement `StorageFullError` and `StorageUnavailableError` typed error classes
    - Implement `getAll()`: reads `"hearth_transcripts"` key, parses JSON, returns `SavedTranscript[]` sorted descending by `savedAt`; returns `[]` on parse error
    - Implement `add(transcript)`: reads current array, appends, re-serializes; throws `StorageFullError` on `QuotaExceededError`, `StorageUnavailableError` on other errors
    - Implement `remove(id)`: filters out transcript by id, re-serializes
    - Implement `clear()`: removes the key
    - Export a `makeStore(storage: Storage)` factory for testability (accepts injected storage)
    - _Requirements: 1.1, 1.4, 4.2, 5.1, 5.2, 5.3, 5.4, 6.1_

  - [ ]* 2.2 Write property test — Property 1: Persistence round-trip
    - In `frontend/lib/transcriptStore.test.ts`
    - `// Feature: transcript-save-review, Property 1: Persistence round-trip`
    - Use `fc.array(arbitraryMessage(), { minLength: 1 })` with `makeStore(mockLocalStorage())`
    - Assert `store.getAll()[0].messages` deeply equals input messages
    - `{ numRuns: 100 }`
    - _Requirements: 1.1, 5.2, 5.4, 5.5_

  - [ ]* 2.3 Write property test — Property 3: Saved transcript IDs are unique
    - `// Feature: transcript-save-review, Property 3: Saved transcript IDs are unique`
    - Use `fc.array(fc.array(arbitraryMessage(), { minLength: 1 }), { minLength: 2, maxLength: 20 })`
    - Assert `new Set(ids).size === ids.length`
    - `{ numRuns: 100 }`
    - _Requirements: 1.4_

  - [ ]* 2.4 Write property test — Property 4: Transcript list is reverse-chronological
    - `// Feature: transcript-save-review, Property 4: Transcript list is reverse-chronological`
    - Use `fc.array(arbitraryTranscript(), { minLength: 2 })`
    - Assert each consecutive pair satisfies `result[i-1].savedAt >= result[i].savedAt`
    - `{ numRuns: 100 }`
    - _Requirements: 2.1_

  - [ ]* 2.5 Write property test — Property 8: Delete removes transcript
    - `// Feature: transcript-save-review, Property 8: Delete removes transcript`
    - Use `arbitraryTranscript()`; add then remove; assert id absent from `getAll()`
    - `{ numRuns: 100 }`
    - _Requirements: 4.2_

  - [ ]* 2.6 Write property test — Property 9: Storage errors are surfaced without crash
    - `// Feature: transcript-save-review, Property 9: Storage errors are surfaced without crash`
    - Simulate `QuotaExceededError` and `SecurityError` from mock storage
    - Assert `StorageFullError` / `StorageUnavailableError` thrown; in-memory state unchanged
    - `{ numRuns: 100 }`
    - _Requirements: 5.3, 6.1_

  - [ ]* 2.7 Write unit tests for `transcriptStore`
    - Empty-array rejection (no messages → not saved)
    - Corrupted JSON recovery (returns `[]`, does not throw)
    - `QuotaExceededError` → `StorageFullError`
    - `StorageUnavailableError` on unavailable storage
    - _Requirements: 1.2, 5.3, 6.1_

- [x] 3. Checkpoint — Ensure all store tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 4. Implement `useTranscripts` hook
  - [-] 4.1 Add `useTranscripts` to `frontend/hooks/index.ts`
    - Import `makeStore` from `transcriptStore`; instantiate with `window.localStorage` (guard for SSR)
    - State: `transcripts: SavedTranscript[]`, `storageError: string | null`
    - `saveTranscript(messages)`: returns `{ ok: false, reason: "empty" }` if `messages.length === 0`; calls `store.add(makeTranscript(messages))`; catches `StorageFullError` → `{ ok: false, reason: "storage_full" }`; catches other errors → `{ ok: false, reason: "unavailable" }`; on success refreshes state and returns `{ ok: true }`
    - `deleteTranscript(id)`: calls `store.remove(id)`, refreshes state, catches errors → sets `storageError`
    - `dismissStorageError`: clears `storageError`
    - `makeTranscript` helper: generates UUID v4 id, auto-title `"Session – {weekday} {day} {month}, {HH:MM}"`, sets `savedAt: Date.now()`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.2, 5.3, 6.1_

  - [ ]* 4.2 Write property test — Property 2: Empty save is rejected
    - In `frontend/hooks/useTranscripts.test.ts`
    - `// Feature: transcript-save-review, Property 2: Empty save is rejected`
    - Assert `saveTranscript([])` returns `{ ok: false, reason: "empty" }` and store unchanged
    - `{ numRuns: 100 }`
    - _Requirements: 1.2_

  - [ ]* 4.3 Write unit tests for `useTranscripts`
    - Successful save updates `transcripts` list
    - `storageError` set on storage failure
    - `dismissStorageError` clears error
    - _Requirements: 1.1, 1.3, 5.3_

- [ ] 5. Implement `SaveButton` component
  - [~] 5.1 Create `frontend/components/SaveButton.tsx` and `SaveButton.module.css`
    - Props: `messages: TranslationResult[]`, `onSave: () => SaveResult`, `onClear: () => void`
    - Renders a floppy-disk / bookmark icon button
    - On tap: calls `onSave()`; shows inline toast — "Saved" on `{ ok: true }`, "Nothing to save yet" on `reason: "empty"`, "Storage full — delete old transcripts to save new ones" on `reason: "storage_full"`, "Transcripts unavailable on this device" on `reason: "unavailable"`
    - On success toast: show "Clear & start new session" action that calls `onClear`
    - Toast auto-dismisses after 3 s
    - _Requirements: 1.2, 1.3, 1.5, 6.1_

  - [ ]* 5.2 Write unit tests for `SaveButton`
    - Success toast shown on save
    - "Nothing to save yet" toast shown for empty conversation
    - "Clear & start new session" action calls `onClear`
    - _Requirements: 1.2, 1.3, 1.5_

- [ ] 6. Implement `TranscriptList` component
  - [~] 6.1 Create `frontend/components/TranscriptList.tsx` and `TranscriptList.module.css`
    - Props: `transcripts: SavedTranscript[]`, `onSelect: (id: string) => void`, `onDelete: (id: string) => void`
    - Renders scrollable list; each row shows title, formatted `savedAt` date, and message count
    - Shows "No saved transcripts yet" when list is empty (Requirement 2.3)
    - Delete button on each row opens a `window.confirm` dialog before calling `onDelete`
    - _Requirements: 2.1, 2.2, 2.3, 4.1, 4.3_

  - [ ]* 6.2 Write property test — Property 5: List row contains required fields
    - In `frontend/components/TranscriptList.test.tsx`
    - `// Feature: transcript-save-review, Property 5: List row contains required fields`
    - Use `arbitrarySavedTranscript()`; render `<TranscriptList>`; assert title, formatted date, and message count present in output
    - `{ numRuns: 100 }`
    - _Requirements: 2.2, 6.2_

  - [ ]* 6.3 Write unit tests for `TranscriptList`
    - Empty state renders "No saved transcripts yet"
    - Delete button triggers confirm dialog
    - _Requirements: 2.3, 4.1_

- [ ] 7. Implement `TranscriptViewer` component
  - [~] 7.1 Create `frontend/components/TranscriptViewer.tsx` and `TranscriptViewer.module.css`
    - Props: `transcript: SavedTranscript`, `onBack: () => void`
    - Renders messages in ascending `timestamp` order
    - Each message row shows: speaker role label, original text, translated text, detected source language code, target language code, formatted time from `timestamp`
    - Worker messages (`speaker === "bottom"`) right-aligned; resident messages (`speaker === "top"`) left-aligned
    - "Back" button calls `onBack`
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

  - [ ]* 7.2 Write property test — Property 6: Viewer messages are chronological
    - In `frontend/components/TranscriptViewer.test.tsx`
    - `// Feature: transcript-save-review, Property 6: Viewer messages are chronological`
    - Use `arbitrarySavedTranscript()`; render `<TranscriptViewer>`; assert rendered message order matches ascending `timestamp`
    - `{ numRuns: 100 }`
    - _Requirements: 3.1_

  - [ ]* 7.3 Write property test — Property 7: Viewer message row contains required fields
    - `// Feature: transcript-save-review, Property 7: Viewer message row contains required fields`
    - Use `arbitraryMessage()`; render single message row; assert speaker role, original text, translated text, source language code, target language code, and formatted time all present
    - `{ numRuns: 100 }`
    - _Requirements: 3.2_

  - [ ]* 7.4 Write unit tests for `TranscriptViewer`
    - All six message fields present for a known fixture
    - Worker message is right-aligned, resident message is left-aligned
    - Back button calls `onBack`
    - _Requirements: 3.2, 3.3, 3.4_

- [ ] 8. Implement `TranscriptOverlay` component
  - [~] 8.1 Create `frontend/components/TranscriptOverlay.tsx` and `TranscriptOverlay.module.css`
    - Props: `transcripts: SavedTranscript[]`, `onDelete: (id: string) => void`, `onClose: () => void`
    - Internal state: `activeTranscriptId: string | null`
    - `position: absolute; inset: 0` within the `.half` container — covers bottom half only
    - Persistent ✕ close button always visible; calls `onClose`
    - When `activeTranscriptId === null`: renders `<TranscriptList>`
    - When `activeTranscriptId` is set: renders `<TranscriptViewer>` with matching transcript
    - _Requirements: 2.4, 3.4, 7.1, 7.2_

  - [ ]* 8.2 Write property test — Property 10: Closing overlay preserves conversation
    - In `frontend/components/TranscriptOverlay.test.tsx` (or `hooks/useTranscripts.test.ts`)
    - `// Feature: transcript-save-review, Property 10: Closing overlay preserves conversation`
    - Use `fc.array(arbitraryMessage(), { minLength: 1 })`; open overlay then close; assert `messages` array unchanged
    - `{ numRuns: 100 }`
    - _Requirements: 7.3_

  - [ ]* 8.3 Write unit tests for `TranscriptOverlay`
    - ✕ button calls `onClose`
    - Selecting a transcript row switches to viewer
    - Back in viewer returns to list
    - _Requirements: 3.4, 7.1_

- [~] 9. Checkpoint — Ensure all component tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Export new components and wire into `page.tsx`
  - [~] 10.1 Add exports to `frontend/components/index.ts`
    - Export `SaveButton`, `TranscriptOverlay`, `TranscriptList`, `TranscriptViewer`
    - _Requirements: 2.4_

  - [~] 10.2 Wire `SaveButton` and `TranscriptOverlay` into `frontend/app/translate/page.tsx`
    - Import `useTranscripts` from `@/hooks`
    - Import `SaveButton`, `TranscriptOverlay` from `@/components`
    - Add `showOverlay: boolean` state (default `false`)
    - Pass `messages`, `saveTranscript`, `clearConversation` to `<SaveButton>`; place it in the bottom `.half` near the worker controls
    - Render `<TranscriptOverlay>` inside the bottom `.half` when `showOverlay === true`; pass `transcripts`, `deleteTranscript`, `onClose={() => setShowOverlay(false)}`
    - Add a "Transcripts" icon button in the bottom `.half` that sets `showOverlay(true)`
    - Surface `storageError` via the existing error toast pattern; call `dismissStorageError` on dismiss
    - _Requirements: 1.1, 1.5, 2.4, 4.3, 5.3, 6.1, 7.1, 7.2, 7.3_

- [~] 11. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for a faster MVP
- Each task references specific requirements for traceability
- Property tests use fast-check with `{ numRuns: 100 }` and a comment tag `// Feature: transcript-save-review, Property N: ...`
- `makeStore(storage)` factory enables injecting a mock `Storage` object in tests without touching `window.localStorage`
- The overlay uses `position: absolute; inset: 0` inside the existing `.half` div — no layout changes needed to the top (resident) half
