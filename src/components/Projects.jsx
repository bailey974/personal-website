import { useEffect, useRef, useState } from 'react'
import styles from './Projects.module.css'
import ProjectModal from './ProjectModal'

const projects = [
  {
    name: '3rd-Year-Project',
    description: 'Real-time collaborative code editor built as a cross-platform desktop app. Multiple users can edit code simultaneously with changes synced via CRDT/WebSocket technology.',
    tags: ['Python', 'React', 'Django', 'Tauri', 'WebSocket', 'Vite'],
    repo: 'https://github.com/bailey974/3rd-Year-Project',
    live: 'https://collab-code-editor.bscanlan-scanlan8.workers.dev',
  },
  {
    name: 'Pizza-Haven',
    description: 'Full-stack pizza ordering web application with a Django backend, Docker containerisation, and SQLite persistence.',
    tags: ['Python', 'Django', 'Docker', 'HTML/CSS'],
    repo: 'https://github.com/bailey974/Pizza-Haven',
  },
  {
    name: 'Shell',
    description: 'A custom Unix shell implementation written in C, completed across three progressive stages as part of an Operating Systems module.',
    tags: ['C', 'OS', 'Makefile'],
    repo: 'https://github.com/bailey974/Shell',
  },
  {
    name: 'C_auto_compiler',
    description: 'Python utility that automates the GCC compilation workflow for C/C++ projects, reducing manual build steps.',
    tags: ['Python', 'GCC', 'Automation'],
    repo: 'https://github.com/bailey974/C_auto_compiler',
  },
]

const TAG_COLORS = {
  Python:      { bg: 'rgba(255, 214, 0, 0.1)',   color: '#ffd600' },
  React:       { bg: 'rgba(88, 166, 255, 0.1)',   color: '#58a6ff' },
  Django:      { bg: 'rgba(63, 185, 80, 0.1)',    color: '#3fb950' },
  Tauri:       { bg: 'rgba(188, 140, 255, 0.1)',  color: '#bc8cff' },
  WebSocket:   { bg: 'rgba(88, 166, 255, 0.1)',   color: '#58a6ff' },
  Vite:        { bg: 'rgba(188, 140, 255, 0.1)',  color: '#bc8cff' },
  'HTML/CSS':  { bg: 'rgba(248, 81, 73, 0.1)',    color: '#f85149' },
  Docker:      { bg: 'rgba(88, 166, 255, 0.1)',   color: '#58a6ff' },
  C:           { bg: 'rgba(139, 148, 158, 0.1)',  color: '#8b949e' },
  OS:          { bg: 'rgba(210, 153, 34, 0.1)',   color: '#d29922' },
  Makefile:    { bg: 'rgba(139, 148, 158, 0.1)',  color: '#8b949e' },
  GCC:         { bg: 'rgba(139, 148, 158, 0.1)',  color: '#8b949e' },
  Automation:  { bg: 'rgba(63, 185, 80, 0.1)',    color: '#3fb950' },
}

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'today'
  if (days === 1) return '1d ago'
  if (days < 30) return `${days}d ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(months / 12)}y ago`
}

export default function Projects({ externalProject, onClearExternal }) {
  const [activeProject, setActiveProject] = useState(null)
  const [ghStats, setGhStats]             = useState({}) // { repoName: { pushed, stars } }
  const [visible, setVisible]             = useState({}) // { repoName: true }
  const cardRefs                          = useRef({})

  // Open project triggered by CLI terminal
  useEffect(() => {
    if (!externalProject) return
    const p = projects.find(x => x.name === externalProject)
    if (p) setActiveProject(p)
    onClearExternal?.()
  }, [externalProject, onClearExternal])

  // Fetch live GitHub stats for each project
  useEffect(() => {
    projects.forEach(({ name }) => {
      fetch(`https://api.github.com/repos/bailey974/${name}`)
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (!data) return
          setGhStats(s => ({
            ...s,
            [name]: { pushed: data.pushed_at, stars: data.stargazers_count },
          }))
        })
        .catch(() => {})
    })
  }, [])

  // Stagger-fade cards in with IntersectionObserver
  useEffect(() => {
    const observers = []
    projects.forEach(({ name }) => {
      const el = cardRefs.current[name]
      if (!el) return
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) { setVisible(v => ({ ...v, [name]: true })); obs.disconnect() } },
        { threshold: 0.1 }
      )
      obs.observe(el)
      observers.push(obs)
    })
    return () => observers.forEach(o => o.disconnect())
  }, [])

  return (
    <section id="projects" className={styles.section}>
      <div className={styles.header}>
        <span className={styles.green}>$</span>
        <span className={styles.cmd}> ls -la projects/</span>
      </div>

      <div className={styles.grid}>
        {projects.map((p, i) => {
          const stats = ghStats[p.name]
          const isVisible = visible[p.name]
          return (
            <article
              key={p.name}
              ref={el => cardRefs.current[p.name] = el}
              className={`${styles.card} ${isVisible ? styles.cardVisible : ''}`}
              style={{ transitionDelay: `${i * 80}ms` }}
              onClick={() => setActiveProject(p)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setActiveProject(p)}
            >
              <div className={styles.cardHeader}>
                <span className={styles.icon}>📁</span>
                <span className={styles.name}>{p.name}</span>
                <div className={styles.actions}>
                  <span className={styles.runHint}>▶ run</span>
                  <a
                    href={p.repo}
                    target="_blank"
                    rel="noreferrer"
                    className={styles.action}
                    title="Source code"
                    onClick={e => e.stopPropagation()}
                  >
                    {'</>'}
                  </a>
                </div>
              </div>
              <p className={styles.desc}>{p.description}</p>
              <div className={styles.tags}>
                {p.tags.map((tag) => {
                  const style = TAG_COLORS[tag] ?? { bg: 'rgba(139, 148, 158, 0.1)', color: '#8b949e' }
                  return (
                    <span key={tag} className={styles.tag} style={{ background: style.bg, color: style.color }}>
                      {tag}
                    </span>
                  )
                })}
              </div>
              {stats && (
                <div className={styles.ghStats}>
                  <span className={styles.ghPushed}>⏱ {timeAgo(stats.pushed)}</span>
                  {stats.stars > 0 && <span className={styles.ghStars}>★ {stats.stars}</span>}
                </div>
              )}
            </article>
          )
        })}
      </div>

      {activeProject && (
        <ProjectModal
          project={activeProject}
          onClose={() => setActiveProject(null)}
        />
      )}
    </section>
  )
}
