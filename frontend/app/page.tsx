import Link from "next/link";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <main className={styles.page}>
      <div className={styles.container}>
        {/* Logo */}
        <div className={styles.logo}>
          <svg
            width="52"
            height="52"
            viewBox="0 0 52 52"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="26" cy="26" r="26" fill="#e8b298" />
            {/* flame */}
            <path
              d="M26 38c-5.5 0-10-4-10-9 0-3.5 2-6.5 4-8.5 0 2.5 1.5 4 3 4-1-3 1-7 5-9-0.5 3 1 5.5 3 6.5 1-1.5 1-3.5 0.5-5C33.5 18 36 22 36 29c0 5-4.5 9-10 9z"
              fill="#3d2218"
            />
            <path
              d="M26 35c-2.5 0-4.5-1.8-4.5-4 0-1.5 0.8-2.8 2-3.8 0 1.2 0.8 2 1.5 2-0.3-1.5 0.5-3 2-4-0.2 1.2 0.5 2.3 1.3 2.8 0.5-0.7 0.5-1.5 0.2-2.2 1.5 1 2.5 2.8 2.5 5 0 2.2-2 4-5 4.2z"
              fill="#e8b298"
            />
          </svg>
          <span className={styles.logoText}>Hearth</span>
        </div>

        {/* Headline */}
        <h1 className={styles.headline}>
          Real-time translation,
          <br />
          <em>face to face</em>
        </h1>

        <p className={styles.tagline}>
          Place a device between two people. Speak naturally. Hearth translates
          both sides instantly — no apps to download, no accounts needed.
        </p>

        {/* Feature chips */}
        <div className={styles.features}>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🎙</span>
            <span>Speak any language</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>⚡</span>
            <span>Instant translation</span>
          </div>
          <div className={styles.feature}>
            <span className={styles.featureIcon}>🔒</span>
            <span>Private &amp; offline-ready</span>
          </div>
        </div>

        {/* CTA */}
        <Link href="/app" className={styles.cta}>
          Begin conversation
        </Link>

        <p className={styles.built}>
          Built for shelter staff and residents
        </p>
      </div>
    </main>
  );
}
