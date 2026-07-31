"use client";

import { useState, useCallback, useEffect } from "react";
import type { TranslationResult, SavedTranscript } from "@/types";
import { makeStore, StorageFullError } from "@/lib/transcriptStore";

type SaveResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "storage_full" | "unavailable" };

export interface UseTranscriptsReturn {
  transcripts: SavedTranscript[];
  saveTranscript(messages: TranslationResult[]): SaveResult;
  deleteTranscript(id: string): void;
  storageError: string | null;
  dismissStorageError: () => void;
}

// Build a titled, timestamped transcript record from a list of messages
function makeTranscript(messages: TranslationResult[]): SavedTranscript {
  const now = new Date();
  const weekday = now.toLocaleDateString("en-GB", { weekday: "short" });
  const day = now.getDate();
  const month = now.toLocaleDateString("en-GB", { month: "short" });
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const title = `Session – ${weekday} ${day} ${month}, ${hours}:${minutes}`;
  return {
    id: crypto.randomUUID(),
    title,
    savedAt: Date.now(),
    messages,
  };
}

let _store: ReturnType<typeof makeStore> | null = null;

// Lazily create the localStorage-backed transcript store (client-side only)
function getStore() {
  if (typeof window === "undefined") return null;
  if (!_store) _store = makeStore(window.localStorage);
  return _store;
}

// Manage saved transcripts: loading, saving, and deleting them from local storage
export function useTranscripts(): UseTranscriptsReturn {
  const [transcripts, setTranscripts] = useState<SavedTranscript[]>([]);
  const [storageError, setStorageError] = useState<string | null>(null);

  // Load any previously saved transcripts on mount
  useEffect(() => {
    const store = getStore();
    if (!store) return;
    try {
      setTranscripts(store.getAll());
    } catch {
      setStorageError("Could not load saved transcripts");
    }
  }, []);

  // Save the current conversation as a new transcript
  const saveTranscript = useCallback(
    (messages: TranslationResult[]): SaveResult => {
      if (messages.length === 0) return { ok: false, reason: "empty" };
      const store = getStore();
      if (!store) return { ok: false, reason: "unavailable" };
      try {
        store.add(makeTranscript(messages));
        setTranscripts(store.getAll());
        return { ok: true };
      } catch (err) {
        if (err instanceof StorageFullError) {
          return { ok: false, reason: "storage_full" };
        }
        return { ok: false, reason: "unavailable" };
      }
    },
    []
  );

  // Delete a saved transcript by id
  const deleteTranscript = useCallback((id: string) => {
    const store = getStore();
    if (!store) return;
    try {
      store.remove(id);
      setTranscripts(store.getAll());
    } catch (err) {
      setStorageError(
        err instanceof Error ? err.message : "Could not delete transcript"
      );
    }
  }, []);

  // Clear the current storage error message
  const dismissStorageError = useCallback(() => setStorageError(null), []);

  return { transcripts, saveTranscript, deleteTranscript, storageError, dismissStorageError };
}
