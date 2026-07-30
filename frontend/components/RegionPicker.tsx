"use client";

import { useState, useEffect } from "react";
import {
  setRegionKey,
  getRegionKey,
  getResidentLanguage,
  getResidentLanguageName,
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
  const [residentLangName, setResidentLangName] = useState(getResidentLanguageName());

  // Poll for resident language — updates after first resident message
  useEffect(() => {
    const id = setInterval(() => {
      setResidentLang(getResidentLanguage());
      setResidentLangName(getResidentLanguageName());
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
    setResidentLangName(null);
    onClearSession();
  }

  return (
    <div className={styles.bar}>
      {/* Region model buttons */}
      <div className={styles.regionGroup}>
        {(Object.keys(REGION_LABELS) as RegionKey[]).map((key, index) => (
          <button
            key={key}
            className={`${styles.regionBtn} ${region === key ? styles.active : ""} ${
              index === 0 ? "tooltipStart" : ""
            }`}
            onClick={() => handleRegion(key)}
            data-tooltip={REGION_DESCRIPTIONS[key]}
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
            <span
              className={styles.langCode}
              data-tooltip={residentLangName ?? undefined}
            >
              {residentLang.code.toUpperCase()}
            </span>
            <button
              className={`${styles.clearBtn} tooltipEnd`}
              onClick={handleClear}
              data-tooltip="New session"
            >
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
