
import Link from "next/link";
import styles from "./page.module.css";

export default function LandingPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.title}>Hearth</h1>
      <p className={styles.subtitle}>Real-time translation, face to face</p>
      <Link href="/translate" className={styles.cta}>
        Start conversation
      </Link>
    </main>
  );
}
