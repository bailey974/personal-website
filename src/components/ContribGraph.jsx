import { useEffect, useRef, useState } from 'react'
import styles from './ContribGraph.module.css'

// 5-level colour scale matching the site's green palette
const LEVELS = [
  'var(--border)',           // 0 — no contributions
  'rgba(63,185,80,0.2)',     // 1
  'rgba(63,185,80,0.45)',    // 2
  'rgba(63,185,80,0.65)',    // 3
  '#3fb950',                 // 4 — max
]

function levelFor(count) {
  if (count === 0) return 0
  if (count <= 2)  return 1
  if (count <= 5)  return 2
  if (count <= 10) return 3
  return 4
}

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

export default function ContribGraph() {
  const [weeks, setWeeks]   = useState([])   // array of 7-day columns
  const [total, setTotal]   = useState(null)
  const [status, setStatus] = useState('loading')
  const [visible, setVisible] = useState(false)
  const sectionRef = useRef(null)
  const wrapRef    = useRef(null)

  useEffect(() => {
    // Cache-bust per hour so browsers/CDNs never serve a stale day's data
    const hour = new Date().toISOString().slice(0, 13)
    fetch(`https://github-contributions-api.jogruber.de/v4/bailey974?y=last&t=${hour}`, { cache: 'no-store' })
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => {
        // data.contributions = [{ date, count }, ...]
        const contribs = data.contributions ?? []
        setTotal(contribs.reduce((s, d) => s + d.count, 0))

        // Pad the start so every column is a Sun→Sat week, as on GitHub
        const firstDow = contribs.length ? new Date(contribs[0].date + 'T00:00:00Z').getUTCDay() : 0
        const padded = [...Array(firstDow).fill(null), ...contribs]

        // Group into weeks (Sun-based columns of 7 days)
        const cols = []
        let col = []
        for (const day of padded) {
          col.push(day)
          if (col.length === 7) { cols.push(col); col = [] }
        }
        if (col.length) cols.push(col)
        setWeeks(cols)
        setStatus('ok')
      })
      .catch(() => setStatus('error'))
  }, [])

  // Newest weeks are on the right — on narrow screens start scrolled there
  useEffect(() => {
    if (status === 'ok' && wrapRef.current) {
      wrapRef.current.scrollLeft = wrapRef.current.scrollWidth
    }
  }, [status, weeks])

  // Fade in when scrolled into view
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

  // Build month label positions from week data
  const monthLabels = []
  if (weeks.length) {
    let lastMonth = -1
    weeks.forEach((col, wi) => {
      const first = col.find(Boolean)
      if (!first) return
      const month = new Date(first.date + 'T00:00:00Z').getUTCMonth()
      if (month !== lastMonth) {
        monthLabels.push({ wi, label: MONTHS[month] })
        lastMonth = month
      }
    })
  }

  return (
    <section
      ref={sectionRef}
      id="contrib"
      className={`${styles.section} ${visible ? styles.visible : ''}`}
    >
      <div className={styles.header}>
        <span className={styles.green}>$</span>
        <span className={styles.cmd}> git log --oneline --graph</span>
        {total !== null && (
          <span className={styles.totalLabel}>{total} contributions in the last year</span>
        )}
      </div>

      {status === 'loading' && (
        <div className={styles.loading}>
          <span className={styles.green}>$</span> fetching contribution data
          <span className={styles.dots} />
        </div>
      )}

      {status === 'error' && (
        <div className={styles.error}>could not load contribution data</div>
      )}

      {status === 'ok' && (
        <div className={styles.graphWrap} ref={wrapRef}>
          {/* Month labels */}
          <div className={styles.monthRow}>
            {monthLabels.map(({ wi, label }) => (
              <span
                key={wi}
                className={styles.monthLabel}
                style={{ gridColumnStart: wi + 1 }}
              >
                {label}
              </span>
            ))}
          </div>

          {/* Cell grid */}
          <div className={styles.grid}>
            {weeks.map((col, wi) => (
              <div key={wi} className={styles.col}>
                {col.map((day, di) => day === null ? (
                  <div key={`pad-${di}`} className={styles.cell} style={{ visibility: 'hidden' }} />
                ) : (
                  <div
                    key={day.date}
                    className={styles.cell}
                    style={{ background: LEVELS[levelFor(day.count)] }}
                    title={`${day.date}: ${day.count} contribution${day.count !== 1 ? 's' : ''}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className={styles.legend}>
            <span className={styles.legendLabel}>Less</span>
            {LEVELS.map((bg, i) => (
              <div key={i} className={styles.cell} style={{ background: bg }} />
            ))}
            <span className={styles.legendLabel}>More</span>
          </div>
        </div>
      )}
    </section>
  )
}
