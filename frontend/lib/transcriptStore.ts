import type { SavedTranscript } from "@/types";

const STORAGE_KEY = "hearth_transcripts";

// ─── Typed error classes ───

// Thrown when the storage quota has been exceeded
export class StorageFullError extends Error {
  constructor() {
    super("Storage quota exceeded");
    this.name = "StorageFullError";
  }
}

// Thrown when storage can't be read or written at all
export class StorageUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Storage is unavailable");
    this.name = "StorageUnavailableError";
    if (cause instanceof Error) this.cause = cause;
  }
}

// ─── Pure functions (accept injected storage) ───

// Get all saved transcripts, most recently saved first
export function getAll(storage: Storage): SavedTranscript[] {
  try {
    const raw = storage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedTranscript[];
    return parsed.sort((a, b) => b.savedAt - a.savedAt);
  } catch {
    return [];
  }
}

// Save a new transcript, throwing if storage is full or unavailable
export function add(storage: Storage, transcript: SavedTranscript): void {
  try {
    const current = getAll(storage);
    current.push(transcript);
    storage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch (err) {
    if (
      err instanceof DOMException &&
      (err.name === "QuotaExceededError" ||
        err.name === "NS_ERROR_DOM_QUOTA_REACHED")
    ) {
      throw new StorageFullError();
    }
    throw new StorageUnavailableError(err);
  }
}

// Delete a saved transcript by id
export function remove(storage: Storage, id: string): void {
  try {
    const current = getAll(storage);
    const filtered = current.filter((t) => t.id !== id);
    storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    throw new StorageUnavailableError(err);
  }
}

// Delete all saved transcripts
export function clear(storage: Storage): void {
  storage.removeItem(STORAGE_KEY);
}

// ─── Factory (enables injecting mock storage in tests) ───

export interface TranscriptStore {
  getAll(): SavedTranscript[];
  add(transcript: SavedTranscript): void;
  remove(id: string): void;
  clear(): void;
}

// Build a TranscriptStore bound to a specific storage instance
export function makeStore(storage: Storage): TranscriptStore {
  return {
    getAll: () => getAll(storage),
    add: (transcript) => add(storage, transcript),
    remove: (id) => remove(storage, id),
    clear: () => clear(storage),
  };
}
