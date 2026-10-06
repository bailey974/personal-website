import { useCallback, useEffect, useRef, useState } from 'react'
import styles from './ShellRunner.module.css'

export default function ShellRunner() {
  const [status, setStatus]         = useState('loading') // 'loading' | 'ready' | 'error'
  const [prompt, setPrompt]         = useState('')
  const [history, setHistory]       = useState([])
  const [input, setInput]           = useState('')
  const [cmdHistory, setCmdHistory] = useState([])
  const [histIdx, setHistIdx]       = useState(-1)
  const apiRef   = useRef(null)
  const inputRef = useRef(null)
  const bodyRef  = useRef(null)
  const capturedRef = useRef([])

  useEffect(() => {
    let cancelled = false

    window.__wasmShellClear = () => setHistory([])

    // BASE_URL keeps this working when the site is served from a sub-path (GitHub Pages)
    const wasmModuleUrl = `${import.meta.env.BASE_URL}wasm/shell.js`
    import(/* @vite-ignore */ wasmModuleUrl)
      .then(({ default: createShellModule }) =>
        createShellModule({
          print: text => capturedRef.current.push({ t: 'out', v: text }),
          printErr: text => capturedRef.current.push({ t: 'err', v: text }),
        })
      )
      .then(Module => {
        if (cancelled) return
        const api = {
          init:     Module.cwrap('shell_init', null, []),
          runLine:  Module.cwrap('shell_run_line', null, ['string']),
          getPrompt: Module.cwrap('shell_get_prompt', 'string', []),
        }
        api.init()
        apiRef.current = api
        setPrompt(api.getPrompt())
        setStatus('ready')
      })
      .catch(() => {
        if (!cancelled) setStatus('error')
      })

    return () => {
      cancelled = true
      delete window.__wasmShellClear
    }
  }, [])

  useEffect(() => {
    if (status === 'ready') setTimeout(() => inputRef.current?.focus(), 50)
  }, [status])

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [history])

  const submit = useCallback(() => {
    const api = apiRef.current
    if (!api) return
    const trimmed = input.trim()
    if (!trimmed) return

    capturedRef.current = []
    setHistory(h => [...h, { t: 'prompt', v: trimmed }])
    api.runLine(trimmed)
    const out = capturedRef.current
    if (out.length) setHistory(h => [...h, ...out])
    setPrompt(api.getPrompt())

    setCmdHistory(h => [trimmed, ...h.filter(x => x !== trimmed)].slice(0, 50))
    setInput('')
    setHistIdx(-1)
  }, [input])

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
    <div className={styles.root}>
      <div className={styles.badge}>⚡ compiled to WebAssembly — real execution, not a recording</div>

      {status === 'loading' && (
        <div className={styles.state}>compiling customshell.c to WebAssembly<span className={styles.dots} /></div>
      )}
      {status === 'error' && (
        <div className={styles.stateErr}>failed to load the WebAssembly module</div>
      )}

      {status === 'ready' && (
        <div
          className={styles.body}
          ref={bodyRef}
          onClick={() => inputRef.current?.focus()}
        >
          {history.map((line, i) => {
            if (line.t === 'prompt') {
              return (
                <div key={i} className={styles.line}>
                  <span className={styles.prompt}>{prompt}</span>
                  <span className={styles.cmd}>{line.v}</span>
                </div>
              )
            }
            return (
              <div key={i} className={styles.line}>
                <span className={line.t === 'err' ? styles.err : styles.out}>{line.v}</span>
              </div>
            )
          })}

          <div className={styles.line}>
            <span className={styles.prompt}>{prompt}</span>
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
      )}
    </div>
  )
}
