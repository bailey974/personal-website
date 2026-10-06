import { useEffect, useRef, useState, useCallback } from 'react'
import styles from './CliTerminal.module.css'
import { runCommand } from '../terminalCommands'

export default function CliTerminal({ open, onClose, onOpenProject }) {
  const [history, setHistory] = useState([
    { t: 'info', v: "bailey's terminal  —  type 'help' to see commands" },
    { t: 'info', v: '' },
  ])
  const [input, setInput]           = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [histIdx, setHistIdx]       = useState(-1)
  const inputRef = useRef(null)
  const bodyRef  = useRef(null)

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Scroll to bottom on new output
  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [history])

  const submit = useCallback(() => {
    const trimmed = input.trim()
    const lines = trimmed ? runCommand(trimmed, (name) => {
      onOpenProject(name)
      onClose()
    }) : []

    // Handle special directives
    if (lines.some(l => l.t === 'exit')) { onClose(); return }

    const echoLine = trimmed ? [{ t: 'prompt', v: trimmed }] : []

    if (lines.some(l => l.t === 'clear')) {
      setHistory([{ t: 'info', v: '' }])
    } else {
      setHistory(h => [...h, ...echoLine, ...lines, { t: 'info', v: '' }])
    }

    if (trimmed) {
      setCmdHistory(h => [trimmed, ...h.filter(x => x !== trimmed)].slice(0, 50))
    }
    setInput('')
    setHistIdx(-1)
  }, [input, onClose, onOpenProject])

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
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  if (!open) return null

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.window} onClick={e => e.stopPropagation()}>
        {/* Title bar */}
        <div className={styles.titlebar}>
          <span className={styles.dot} style={{ background: '#f85149' }} onClick={onClose} />
          <span className={styles.dot} style={{ background: '#d29922' }} />
          <span className={styles.dot} style={{ background: '#3fb950' }} />
          <span className={styles.title}>~/bailey_scanlan — terminal</span>
          <span className={styles.kbd}>ESC to close</span>
        </div>

        {/* Output */}
        <div className={styles.body} ref={bodyRef}>
          {history.map((line, i) => {
            if (line.t === 'prompt') {
              return (
                <div key={i} className={styles.line}>
                  <span className={styles.ps1}>bailey@portfolio:~$</span>
                  <span className={styles.lineCmd}> {line.v}</span>
                </div>
              )
            }
            return (
              <div key={i} className={`${styles.line} ${styles[`t_${line.t}`]}`}>
                {line.v}
              </div>
            )
          })}

          {/* Input row */}
          <div className={styles.line}>
            <span className={styles.ps1}>bailey@portfolio:~$</span>
            <input
              ref={inputRef}
              className={styles.input}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
              spellCheck={false}
              autoComplete="off"
              autoCorrect="off"
            />
          </div>
        </div>
      </div>
    </div>
  )
}
