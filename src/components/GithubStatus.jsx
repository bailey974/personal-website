import { useEffect, useState } from 'react'
import styles from './GithubStatus.module.css'

const STATUS_URL = 'https://www.githubstatus.com/api/v2/status.json'
const HISTORY_URL = 'https://mrshu.github.io/github-statuses/'
const POLL_MS = 5 * 60 * 1000

// Statuspage indicator -> dot color + short label
const INDICATOR_MAP = {
  none:     { dot: styles.dotOk,   label: 'operational' },
  minor:    { dot: styles.dotWarn, label: 'degraded' },
  major:    { dot: styles.dotErr,  label: 'outage' },
  critical: { dot: styles.dotErr,  label: 'outage' },
}

export default function GithubStatus() {
  const [state, setState] = useState({ status: 'loading' }) // loading | ok | error

  useEffect(() => {
    let cancelled = false

    async function poll() {
      try {
        const res = await fetch(STATUS_URL)
        if (!res.ok) throw new Error('status fetch failed')
        const data = await res.json()
        if (cancelled) return
        setState({
          status: 'ok',
          indicator: data.status?.indicator ?? 'none',
          description: data.status?.description ?? 'Operational',
        })
      } catch {
        if (!cancelled) setState({ status: 'error' })
      }
    }

    poll()
    const id = setInterval(poll, POLL_MS)
    return () => { cancelled = true; clearInterval(id) }
  }, [])

  const meta = state.status === 'ok'
    ? (INDICATOR_MAP[state.indicator] ?? INDICATOR_MAP.none)
    : null

  return (
    <a
      href={HISTORY_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.pill}
      title={state.status === 'ok' ? state.description : 'GitHub status unavailable'}
    >
      <span className={`${styles.dot} ${meta ? meta.dot : styles.dotUnknown}`} />
      github: {state.status === 'loading' ? 'checking…' : state.status === 'error' ? 'unknown' : meta.label}
    </a>
  )
}
