import { useEffect, useRef, useState } from 'react'
import styles from './Skills.module.css'

const SKILLS = {
  Languages: [
    { name: 'Python',     level: 90 },
    { name: 'JavaScript', level: 75 },
    { name: 'C',          level: 70 },
    { name: 'Java',       level: 65 },
    { name: 'HTML/CSS',   level: 75 },
    { name: 'R',          level: 50 },
    { name: 'PowerShell', level: 45 },
    { name: 'Bash',       level: 60 },
  ],
  'Frameworks & Libraries': [
    { name: 'Django',     level: 75 },
    { name: 'React',      level: 70 },
    { name: 'Flask',      level: 60 },
    { name: 'Node.js',    level: 55 },
    { name: 'Bootstrap',  level: 65 },
    { name: 'Pandas',     level: 65 },
    { name: 'PyTorch',    level: 45 },
    { name: 'TensorFlow', level: 40 },
  ],
  'Tools & Platforms': [
    { name: 'Git',        level: 85 },
    { name: 'Docker',     level: 60 },
    { name: 'Postman',    level: 65 },
    { name: 'Figma',      level: 55 },
    { name: 'Linux',      level: 70 },
    { name: 'Vite/Tauri', level: 60 },
  ],
}

function Bar({ level, animate }) {
  const filled = Math.round(level / 10)
  const empty  = 10 - filled
  return (
    <span className={styles.bar}>
      <span className={`${styles.filled} ${animate ? styles.filledAnimate : ''}`}
            style={{ '--target': filled }}>
        {'█'.repeat(filled)}
      </span>
      <span className={styles.empty}>{'░'.repeat(empty)}</span>
      <span className={styles.pct}> {level}%</span>
    </span>
  )
}

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
              <span className={styles.bracket}>{'{'}</span>
              <span className={styles.key}> "{category}" </span>
              <span className={styles.bracket}>{'}'}</span>
            </div>
            <ul className={styles.list}>
              {items.map(({ name, level }) => (
                <li key={name} className={styles.item}>
                  <span className={styles.skillName}>{name}</span>
                  <Bar level={level} animate={visible} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  )
}
