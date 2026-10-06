import { useState, useEffect } from 'react'
import styles from './Navbar.module.css'
import GithubStatus from './GithubStatus'

const links = [
  { label: 'about',    href: '#hero' },
  { label: 'projects', href: '#projects' },
  { label: 'skills',   href: '#skills' },
  { label: 'contact',  href: '#contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`${styles.nav} ${scrolled ? styles.scrolled : ''}`}>
      <a href="#hero" className={styles.logo}>
        <span className={styles.green}>~/</span>bailey_scanlan
      </a>

      <nav className={`${styles.links} ${menuOpen ? styles.open : ''}`}>
        {links.map(({ label, href }) => (
          <a
            key={label}
            href={href}
            className={styles.link}
            onClick={() => setMenuOpen(false)}
          >
            <span className={styles.prompt}>{'>'}</span> {label}
          </a>
        ))}
      </nav>

      <div className={styles.right}>
        <GithubStatus />

        <button
          className={styles.burger}
          onClick={() => setMenuOpen(o => !o)}
          aria-label="Toggle menu"
        >
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>
    </header>
  )
}
