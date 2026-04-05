"use client";

import { useState, useEffect } from "react";
import {
  setRegionKey,
  getRegionKey,
  getResidentLanguage,
  clearSession,
  REGION_LABELS,
  REGION_DESCRIPTIONS,
  type RegionKey,
} from "@/lib/hearth-translation-service";
import styles from "./RegionPicker.module.css";

interface RegionPickerProps {
  /** Called when session is cleared so parent can reset messages */
  onClearSession: () => void;
}

export function RegionPicker({ onClearSession }: RegionPickerProps) {
  const [region, setRegion] = useState<RegionKey>(getRegionKey());
  const [residentLang, setResidentLang] = useState(getResidentLanguage());

  // Poll for resident language — updates after first resident message
  useEffect(() => {
    const id = setInterval(() => {
      const lang = getResidentLanguage();
      setResidentLang(lang);
    }, 500);
    return () => clearInterval(id);
  }, []);

  function handleRegion(key: RegionKey) {
    setRegionKey(key);
    setRegion(key);
  }

  function handleClear() {
    clearSession();
    setResidentLang(null);
    onClearSession();
  }

  return (
    <div className={styles.bar}>
      {/* Region model buttons */}
      <div className={styles.regionGroup}>
        {(Object.keys(REGION_LABELS) as RegionKey[]).map((key) => (
          <button
            key={key}
            className={`${styles.regionBtn} ${region === key ? styles.active : ""}`}
            onClick={() => handleRegion(key)}
            title={REGION_DESCRIPTIONS[key]}
          >
            {REGION_LABELS[key]}
          </button>
        ))}
      </div>

      {/* Session state */}
      <div className={styles.sessionState}>
        {residentLang ? (
          <>
            <span className={styles.langFlag}>{residentLang.flag}</span>
            <span className={styles.langCode}>{residentLang.code.toUpperCase()}</span>
            <button className={styles.clearBtn} onClick={handleClear} title="New session">
              ✕
            </button>
          </>
        ) : (
          <span className={styles.waiting}>waiting…</span>
        )}
      </div>
    </div>
  );
}
