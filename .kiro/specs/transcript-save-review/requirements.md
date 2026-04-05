# Requirements Document

## Introduction

The transcript save and review feature allows workers (e.g. healthcare or support staff) to save a conversation transcript at the end of a session and review it later. The transcript captures the full bilingual exchange — both the original spoken/typed text and its translation — so the worker can refer back to what was communicated. This is a worker-only feature; residents do not interact with it. Since HearTh has no backend database, transcripts are persisted locally using the browser's localStorage, making them available across sessions on the same device.

## Glossary

- **Worker**: The staff member (e.g. healthcare worker, support worker) who operates the app on their device.
- **Resident**: The person the worker is communicating with, who speaks a different language.
- **Transcript**: A saved record of a completed conversation session, containing all messages exchanged between the worker and resident.
- **Message**: A single `TranslationResult` entry in the conversation, containing the original text, translated text, speaker, languages, and timestamp.
- **Session**: A single conversation between a worker and a resident, starting when the first message is sent and ending when the worker saves or discards it.
- **Transcript_Store**: The localStorage-backed persistence layer that stores and retrieves transcripts on the worker's device.
- **Transcript_Viewer**: The UI component that displays a saved transcript in a readable, chronological format.
- **Transcript_List**: The UI component that lists all saved transcripts for the worker to browse.

---

## Requirements

### Requirement 1: Save a Conversation Transcript

**User Story:** As a worker, I want to save the current conversation as a transcript, so that I can refer back to what was communicated during the session.

#### Acceptance Criteria

1. WHEN the worker initiates a save action, THE Transcript_Store SHALL persist the current conversation's messages, a worker-assigned or auto-generated title, and the session timestamp to localStorage.
2. WHEN the worker initiates a save action and the conversation contains no messages, THE Transcript_Store SHALL not save the transcript and THE app SHALL display an informational message indicating there is nothing to save.
3. WHEN a transcript is saved successfully, THE app SHALL display a confirmation to the worker.
4. THE Transcript_Store SHALL assign each saved transcript a unique identifier at the time of saving.
5. WHEN a transcript is saved, THE app SHALL offer the worker the option to clear the current conversation and start a new session.

---

### Requirement 2: Browse Saved Transcripts

**User Story:** As a worker, I want to see a list of my saved transcripts, so that I can find and open a past conversation.

#### Acceptance Criteria

1. THE Transcript_List SHALL display all saved transcripts in reverse-chronological order (most recent first).
2. THE Transcript_List SHALL display, for each transcript entry: the title, the session date, and the number of messages.
3. WHEN no transcripts have been saved, THE Transcript_List SHALL display a message indicating no transcripts are available.
4. THE Transcript_List SHALL be accessible from the worker's side of the app without disrupting an active conversation.

---

### Requirement 3: View a Saved Transcript

**User Story:** As a worker, I want to read through a saved transcript, so that I can review the full conversation that took place.

#### Acceptance Criteria

1. WHEN the worker selects a transcript from the list, THE Transcript_Viewer SHALL display all messages in chronological order.
2. THE Transcript_Viewer SHALL display, for each message: the speaker role (worker or resident), the original text, the translated text, the detected source language, the target language, and the time the message was sent.
3. THE Transcript_Viewer SHALL visually distinguish worker messages from resident messages.
4. WHEN the worker is viewing a transcript, THE Transcript_Viewer SHALL provide a way to return to the transcript list.

---

### Requirement 4: Delete a Saved Transcript

**User Story:** As a worker, I want to delete a saved transcript, so that I can remove records I no longer need.

#### Acceptance Criteria

1. WHEN the worker initiates a delete action on a transcript, THE app SHALL prompt the worker to confirm the deletion before proceeding.
2. WHEN the worker confirms deletion, THE Transcript_Store SHALL remove the transcript from localStorage.
3. WHEN a transcript is deleted, THE Transcript_List SHALL update to reflect the removal without requiring a page reload.
4. IF the Transcript_Store fails to delete a transcript, THEN THE app SHALL display an error message to the worker.

---

### Requirement 5: Persist Transcripts Across Sessions

**User Story:** As a worker, I want my saved transcripts to be available the next time I open the app, so that I can access past conversations even after closing the browser.

#### Acceptance Criteria

1. THE Transcript_Store SHALL use the browser's localStorage to persist transcripts across page reloads and browser restarts.
2. WHEN the app loads, THE Transcript_Store SHALL read all previously saved transcripts from localStorage and make them available to the Transcript_List.
3. IF localStorage is unavailable or throws an error during a read or write operation, THEN THE app SHALL display an error message to the worker and continue operating without transcript persistence.
4. THE Transcript_Store SHALL store transcripts in a serialized JSON format.
5. FOR ALL valid transcript objects, serializing then deserializing SHALL produce an equivalent transcript object (round-trip property).

---

### Requirement 6: Transcript Storage Limits

**User Story:** As a worker, I want the app to handle storage limits gracefully, so that it does not crash or lose data unexpectedly.

#### Acceptance Criteria

1. IF saving a transcript would exceed the available localStorage quota, THEN THE Transcript_Store SHALL not save the transcript and THE app SHALL display an error message informing the worker that storage is full.
2. THE app SHALL display the number of saved transcripts visible in the Transcript_List.

---

### Requirement 7: Quick Dismissal for Privacy

**User Story:** As a worker, I want to quickly close the transcript view when someone approaches, so that sensitive conversation records are not visible to others in a shared space.

#### Acceptance Criteria

1. WHEN the worker is viewing the Transcript_List or Transcript_Viewer, THE app SHALL provide a single-action control (e.g. a close or back button) to immediately return to the main conversation screen.
2. THE Transcript_List and Transcript_Viewer SHALL NOT be visible to the resident-facing side of the app at any time.
3. WHEN the worker navigates away from the transcript view, THE app SHALL return to the main conversation screen without clearing the active conversation.
