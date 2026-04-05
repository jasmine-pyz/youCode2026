import type { SavedTranscript } from "@/types";

const STORAGE_KEY = "hearth_transcripts";

// ─── Typed error classes ───

export class StorageFullError extends Error {
  constructor() {
    super("Storage quota exceeded");
    this.name = "StorageFullError";
  }
}

export class StorageUnavailableError extends Error {
  constructor(cause?: unknown) {
    super("Storage is unavailable");
    this.name = "StorageUnavailableError";
    if (cause instanceof Error) this.cause = cause;
  }
}

// ─── Pure functions (accept injected storage) ───

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

export function remove(storage: Storage, id: string): void {
  try {
    const current = getAll(storage);
    const filtered = current.filter((t) => t.id !== id);
    storage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    throw new StorageUnavailableError(err);
  }
}

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

export function makeStore(storage: Storage): TranscriptStore {
  return {
    getAll: () => getAll(storage),
    add: (transcript) => add(storage, transcript),
    remove: (id) => remove(storage, id),
    clear: () => clear(storage),
  };
}
