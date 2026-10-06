import { useEffect, useRef, useState } from 'react'
import styles from './Contact.module.css'

const EMAIL = 'bailey@example.com' // TODO: replace with your real email

const SOCIAL = [
  { label: 'email',    value: EMAIL,                                    href: `mailto:${EMAIL}`,                              copyable: true },
  { label: 'github',   value: 'github.com/bailey974',                   href: 'https://github.com/bailey974',                 copyable: false },
  { label: 'linkedin', value: 'linkedin.com/in/bailey-scanlan-24b2321a9', href: 'https://linkedin.com/in/bailey-scanlan-24b2321a9', copyable: false },
  { label: 'leetcode', value: 'leetcode.com/u/scanlab5',                href: 'https://leetcode.com/u/scanlab5',              copyable: false },
]

export default function Contact() {
  const [copied, setCopied]   = useState(false)
  const [visible, setVisible] = useState(false)
  const sectionRef            = useRef(null)

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

  function copyEmail() {
    navigator.clipboard.writeText(EMAIL)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <section id="contact" ref={sectionRef} className={`${styles.section} ${visible ? styles.visible : ''}`}>
      <div className={styles.header}>
        <span className={styles.green}>$</span>
        <span className={styles.cmd}> cat contact.txt</span>
      </div>

      <div className={styles.body}>
        <p className={styles.intro}>
          {'// '}
          <span className={styles.comment}>
            Open to internships, grad roles, collaborations, or just a good conversation.
          </span>
        </p>

        <ul className={styles.list}>
          {SOCIAL.map(({ label, value, href, copyable }) => (
            <li key={label} className={styles.item}>
              <span className={styles.key}>{label}</span>
              <span className={styles.arrow}>{' => '}</span>
              <a href={href} target="_blank" rel="noreferrer" className={styles.link}>
                {value}
              </a>
              {copyable && (
                <button onClick={copyEmail} className={styles.copy}>
                  {copied ? '✓ copied' : 'copy'}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
