import styles from './Loader.module.css'

export default function Loader({ fullPage = true, size = 56 }) {
  const spinner = (
    <div
      className={styles.ring}
      style={{ width: size, height: size }}
      role="status"
      aria-label="Loading"
    >
      <div className={styles.arc} />
    </div>
  )

  if (!fullPage) return spinner

  return (
    <div className={styles.overlay}>
      {spinner}
      <p className={styles.label}>Loading…</p>
    </div>
  )
}
