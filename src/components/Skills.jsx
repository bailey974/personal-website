import { useEffect, useRef, useState } from 'react'
import styles from './Skills.module.css'
import { SKILLS } from '../skills'

export default function Skills() {
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setVisible(true); obs.disconnect() } },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section id="skills" ref={sectionRef} className={styles.section}>
      <div className={styles.header}>
        <span className={styles.green}>$</span>
        <span className={styles.cmd}> cat skills.json</span>
      </div>

      <div className={styles.grid}>
        {Object.entries(SKILLS).map(([category, items]) => (
          <div key={category} className={styles.group}>
            <div className={styles.categoryLabel}>
              <span className={styles.key}>"{category}"</span>
              <span className={styles.bracket}>: {'{'}</span>
            </div>
            <ul className={styles.list}>
              {items.map(({ name, level }, i) => (
                <li
                  key={name}
                  className={`${styles.item} ${visible ? styles.itemVisible : ''}`}
                  style={{ transitionDelay: `${i * 40}ms` }}
                >
                  <span className={styles.skillName}>
                    "{name}"<span className={styles.bracket}>:</span>
                  </span>
                  <span className={`${styles.level} ${styles[level]}`}>"{level}"</span>
                  {i < items.length - 1 && <span className={styles.bracket}>,</span>}
                </li>
              ))}
            </ul>
            <div className={styles.bracket}>{'}'}</div>
          </div>
        ))}
      </div>
    </section>
  )
}
