import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './Hero.module.css'
import { runCommand } from '../terminalCommands'

const LINES = [
  { prompt: '$', cmd: 'whoami', delay: 0 },
  { prompt: '',  cmd: 'bailey_scanlan', delay: 600, indent: true },
  { prompt: '$', cmd: 'cat role.txt', delay: 1200 },
  { prompt: '',  cmd: 'Computer Science Student & Former Software Dev Intern', delay: 1800, indent: true },
  { prompt: '$', cmd: 'cat bio.txt', delay: 2400 },
  { prompt: '',  cmd: "Based in Dublin, Ireland. I build things — from\ncollaborative desktop apps to custom Unix shells.\nCurrently studying CS, shipping projects, and\nlevelling up every day.", delay: 3000, indent: true },
]

export default function Hero({ onOpenProject }) {
  const [visible, setVisible]       = useState(0)
  const [history, setHistory]       = useState([])
  const [cleared, setCleared]       = useState(false)
  const [input, setInput]           = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [histIdx, setHistIdx]       = useState(-1)
  const inputRef = useRef(null)
  const bodyRef  = useRef(null)

  const introDone = visible >= LINES.length

  useEffect(() => {
    LINES.forEach((line, i) => {
      setTimeout(() => setVisible(v => Math.max(v, i + 1)), line.delay)
    })
  }, [])

  // Keep the view pinned to the latest line once the shell is interactive
  useEffect(() => {
    if (introDone && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [history, introDone])

  const submit = useCallback(() => {
    const trimmed = input.trim()
    if (!trimmed) return

    const lines = runCommand(trimmed, (name) => onOpenProject?.(name))

    if (lines.some(l => l.t === 'clear')) {
      setCleared(true)
      setHistory([])
    } else if (lines.some(l => l.t === 'exit')) {
      setHistory(h => [
        ...h,
        { t: 'prompt', v: trimmed },
        { t: 'info', v: "can't exit this one — it's built into the page. try ctrl+k for the popup terminal." },
      ])
    } else {
      setHistory(h => [...h, { t: 'prompt', v: trimmed }, ...lines])
    }

    setCmdHistory(h => [trimmed, ...h.filter(x => x !== trimmed)].slice(0, 50))
    setInput('')
    setHistIdx(-1)
  }, [input, onOpenProject])

  function onKeyDown(e) {
    if (e.key === 'Enter') {
      submit()
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.min(i + 1, cmdHistory.length - 1)
        setInput(cmdHistory[next] ?? '')
        return next
      })
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHistIdx(i => {
        const next = Math.max(i - 1, -1)
        setInput(next === -1 ? '' : cmdHistory[next] ?? '')
        return next
      })
    }
  }

  return (
    <section id="hero" className={styles.hero}>
      <div className={styles.window}>
        <div className={styles.titlebar}>
          <span className={styles.dot} style={{ background: '#f85149' }} />
          <span className={styles.dot} style={{ background: '#d29922' }} />
          <span className={styles.dot} style={{ background: '#3fb950' }} />
          <span className={styles.title}>terminal — bash</span>
        </div>

        <div
          className={`${styles.body} ${introDone ? styles.bodyInteractive : ''}`}
          ref={bodyRef}
          onClick={() => inputRef.current?.focus()}
        >
          {!cleared && LINES.slice(0, visible).map((line, i) => (
            <div key={i} className={`${styles.line} ${line.indent ? styles.indent : ''} fade-in`}>
              {line.prompt && <span className={styles.prompt}>{line.prompt}</span>}
              {line.prompt && ' '}
              <span className={line.indent ? styles.output : styles.cmd}>
                {line.cmd}
              </span>
            </div>
          ))}

          {introDone && history.map((line, i) => {
            if (line.t === 'prompt') {
              return (
                <div key={i} className={styles.line}>
                  <span className={styles.prompt}>$</span>{' '}
                  <span className={styles.cmd}>{line.v}</span>
                </div>
              )
            }
            const cls = line.t === 'grn' ? styles.ok : line.t === 'err' ? styles.err : styles.output
            return (
              <div key={i} className={styles.line}>
                <span className={cls}>{line.v}</span>
              </div>
            )
          })}

          {introDone && (
            <div className={styles.line}>
              <span className={styles.prompt}>$</span>
              <input
                ref={inputRef}
                className={styles.input}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={onKeyDown}
                placeholder="type 'help'…"
                spellCheck={false}
                autoComplete="off"
                autoCorrect="off"
              />
            </div>
          )}
        </div>
      </div>

      <div className={styles.cta}>
        <a
          href="https://github.com/bailey974"
          target="_blank"
          rel="noreferrer"
          className={`${styles.btn} ${styles.btnPrimary}`}
        >
          GitHub
        </a>
        <a
          href="https://linkedin.com/in/bailey-scanlan-24b2321a9"
          target="_blank"
          rel="noreferrer"
          className={styles.btn}
        >
          LinkedIn
        </a>
        <a href="#contact" className={styles.btn}>
          Contact
        </a>
      </div>
    </section>
  )
}
