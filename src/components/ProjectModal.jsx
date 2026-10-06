import { useEffect, useRef, useState } from 'react'
import styles from './ProjectModal.module.css'
import CodePreview from './CodePreview'
import ShellRunner from './ShellRunner'

// Projects that can actually execute client-side (compiled to WASM), as
// opposed to the scripted terminal simulation everyone else gets.
const RUNNABLE = new Set(['Shell'])

// Each line: { text, type, delay }
// types: 'cmd' | 'output' | 'ok' | 'info' | 'ws' | 'blank'
const SIMULATIONS = {
  '3rd-Year-Project': {
    title: 'collab-editor — bash',
    lines: [
      { text: '$ cd 3rd-Year-Project', type: 'cmd',    delay: 0 },
      { text: '$ python manage.py runserver', type: 'cmd', delay: 400 },
      { text: 'Watching for file changes with StatReloader', type: 'output', delay: 800 },
      { text: 'Performing system checks...', type: 'output', delay: 1000 },
      { text: 'System check identified no issues (0 silenced).', type: 'output', delay: 1400 },
      { text: 'Django version 4.2.11  |  settings: collab_editor.settings', type: 'output', delay: 1600 },
      { text: 'Development server at http://127.0.0.1:8000/', type: 'ok', delay: 1900 },
      { text: '', type: 'blank', delay: 2100 },
      { text: '$ node yjs-server.js', type: 'cmd', delay: 2300 },
      { text: 'WebSocket server listening on ws://localhost:1234', type: 'info', delay: 2700 },
      { text: 'Waiting for connections...', type: 'output', delay: 2900 },
      { text: '[WS]   User connected: session_7f3a1b', type: 'ws', delay: 3400 },
      { text: '[CRDT] Sync initiated — 0 conflicts detected', type: 'ws', delay: 3700 },
      { text: '[CRDT] Document state broadcast to 1 peer(s)', type: 'ws', delay: 4000 },
      { text: '', type: 'blank', delay: 4200 },
      { text: '$ open tauri://localhost:1420', type: 'cmd', delay: 4400 },
      { text: '[Tauri] App window opened ✓', type: 'ok', delay: 5000 },
    ],
  },

  'Pizza-Haven': {
    title: 'pizza-haven — bash',
    lines: [
      { text: '$ docker-compose up --build', type: 'cmd', delay: 0 },
      { text: 'Building web...', type: 'output', delay: 400 },
      { text: 'Creating pizza-haven_db_1  ... done', type: 'ok', delay: 900 },
      { text: 'Creating pizza-haven_web_1 ... done', type: 'ok', delay: 1100 },
      { text: 'web_1  | Django version 4.2', type: 'output', delay: 1500 },
      { text: 'web_1  | Starting server at http://0.0.0.0:8000/', type: 'ok', delay: 1800 },
      { text: '', type: 'blank', delay: 2000 },
      { text: '$ curl -s http://localhost:8000/api/menu/', type: 'cmd', delay: 2200 },
      { text: '{', type: 'output', delay: 2600 },
      { text: '  "status": "ok",', type: 'output', delay: 2700 },
      { text: '  "menu": [', type: 'output', delay: 2800 },
      { text: '    { "name": "Margherita",  "price": 12.99 },', type: 'output', delay: 2900 },
      { text: '    { "name": "Pepperoni",   "price": 14.99 },', type: 'output', delay: 3000 },
      { text: '    { "name": "BBQ Chicken", "price": 15.99 }', type: 'output', delay: 3100 },
      { text: '  ]', type: 'output', delay: 3200 },
      { text: '}', type: 'output', delay: 3300 },
      { text: '', type: 'blank', delay: 3500 },
      { text: 'POST /order/ 201 Created', type: 'ok', delay: 3700 },
    ],
  },

  'Shell': {
    title: 'shell — bash',
    lines: [
      { text: '$ make', type: 'cmd', delay: 0 },
      { text: 'gcc -Wall -Wextra -o shell stage3/shell.c', type: 'output', delay: 400 },
      { text: 'Compilation successful.', type: 'ok', delay: 900 },
      { text: '', type: 'blank', delay: 1100 },
      { text: '$ ./shell', type: 'cmd', delay: 1300 },
      { text: 'mysh> ls', type: 'cmd', delay: 1700 },
      { text: 'Documents  Downloads  Projects  README.md', type: 'output', delay: 2000 },
      { text: 'mysh> echo "Hello from my shell!"', type: 'cmd', delay: 2400 },
      { text: 'Hello from my shell!', type: 'output', delay: 2700 },
      { text: 'mysh> pwd', type: 'cmd', delay: 3100 },
      { text: '/home/bailey/Shell', type: 'output', delay: 3400 },
      { text: 'mysh> ls -la | grep README', type: 'cmd', delay: 3800 },
      { text: '-rw-r--r-- 1 bailey users 1.2K Feb 20 README.md', type: 'output', delay: 4100 },
      { text: 'mysh> exit', type: 'cmd', delay: 4500 },
      { text: 'Goodbye.', type: 'output', delay: 4800 },
    ],
  },

  'C_auto_compiler': {
    title: 'c_auto_compiler — bash',
    lines: [
      { text: '$ python auto_compiler.py hello.c', type: 'cmd', delay: 0 },
      { text: '[INFO] Detected source file: hello.c', type: 'info', delay: 400 },
      { text: '[INFO] Running: gcc -Wall -o hello hello.c', type: 'info', delay: 700 },
      { text: '[OK]   Compilation successful', type: 'ok', delay: 1200 },
      { text: '[INFO] Output binary: ./hello', type: 'info', delay: 1400 },
      { text: '', type: 'blank', delay: 1600 },
      { text: '$ ./hello', type: 'cmd', delay: 1800 },
      { text: 'Hello, World!', type: 'output', delay: 2100 },
      { text: '', type: 'blank', delay: 2300 },
      { text: '$ python auto_compiler.py main.c utils.c', type: 'cmd', delay: 2500 },
      { text: '[INFO] Detected 2 source file(s)', type: 'info', delay: 2900 },
      { text: '[INFO] Running: gcc -Wall -o main main.c utils.c', type: 'info', delay: 3100 },
      { text: '[OK]   Compilation successful', type: 'ok', delay: 3700 },
      { text: '[INFO] Output binary: ./main', type: 'info', delay: 3900 },
      { text: '', type: 'blank', delay: 4100 },
      { text: '$ ./main', type: 'cmd', delay: 4300 },
      { text: 'Running main... done.', type: 'output', delay: 4600 },
    ],
  },
}

function lineClass(type) {
  switch (type) {
    case 'cmd':    return styles.lineCmd
    case 'ok':     return styles.lineOk
    case 'info':   return styles.lineInfo
    case 'ws':     return styles.lineWs
    case 'blank':  return styles.lineBlank
    default:       return styles.lineOutput
  }
}

export default function ProjectModal({ project, onClose }) {
  const sim = SIMULATIONS[project.name]
  const [visibleCount, setVisibleCount] = useState(0)
  const [tab, setTab] = useState('terminal')
  const bodyRef = useRef(null)

  const done = visibleCount >= (sim?.lines.length ?? 0)

  // Play through lines
  useEffect(() => {
    if (!sim) return
    const timers = sim.lines.map((line, i) =>
      setTimeout(() => setVisibleCount(v => Math.max(v, i + 1)), line.delay)
    )
    return () => timers.forEach(clearTimeout)
  }, [sim])

  // Auto-switch to code tab 600ms after terminal finishes
  useEffect(() => {
    if (!done) return
    // Only auto-switch if the user is still watching the terminal
    const t = setTimeout(() => setTab(cur => cur === 'terminal' ? 'code' : cur), 600)
    return () => clearTimeout(t)
  }, [done])

  // Auto-scroll terminal body
  useEffect(() => {
    if (tab === 'terminal' && bodyRef.current) {
      bodyRef.current.scrollTop = bodyRef.current.scrollHeight
    }
  }, [visibleCount, tab])

  // Close on Escape
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  if (!sim) return null

  const lines = sim.lines.slice(0, visibleCount)

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.modal} ${tab === 'live' ? styles.modalWide : ''}`}
        onClick={e => e.stopPropagation()}
      >
        {/* Title bar */}
        <div className={styles.titlebar}>
          <span className={styles.dot} style={{ background: '#f85149' }} onClick={onClose} title="Close" />
          <span className={styles.dot} style={{ background: '#d29922' }} />
          <span className={styles.dot} style={{ background: '#3fb950' }} />
          <span className={styles.title}>{sim.title}</span>

          {/* Tabs */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tabBtn} ${tab === 'terminal' ? styles.tabActive : ''}`}
              onClick={() => setTab('terminal')}
            >
              Terminal
            </button>
            <button
              className={`${styles.tabBtn} ${tab === 'code' ? styles.tabActive : ''} ${!done ? styles.tabLocked : ''}`}
              onClick={() => done && setTab('code')}
              title={done ? undefined : 'Wait for terminal to finish…'}
            >
              {done ? 'Source Code' : '⏳ Source Code'}
            </button>
            {RUNNABLE.has(project.name) && (
              <button
                className={`${styles.tabBtn} ${tab === 'run' ? styles.tabActive : ''}`}
                onClick={() => setTab('run')}
              >
                ⚡ Run
              </button>
            )}
            {project.live && (
              <button
                className={`${styles.tabBtn} ${tab === 'live' ? styles.tabActive : ''}`}
                onClick={() => setTab('live')}
              >
                <span className={styles.liveDot} /> Live
              </button>
            )}
          </div>

          <button className={styles.close} onClick={onClose}>✕</button>
        </div>

        {/* Terminal pane */}
        {tab === 'terminal' && (
          <div className={styles.body} ref={bodyRef}>
            {lines.map((line, i) => (
              line.type === 'blank'
                ? <div key={i} className={styles.lineBlank} />
                : <div key={i} className={`${styles.line} ${lineClass(line.type)}`}>
                    {line.text}
                  </div>
            ))}
            {done && (
              <div className={styles.line}>
                <span className={styles.prompt}>$</span>
                {' '}
                <span className={styles.cursor} />
              </div>
            )}
            {done && (
              <div className={styles.switchHint} onClick={() => setTab('code')}>
                ▶ view source code
              </div>
            )}
          </div>
        )}

        {/* Code pane */}
        {tab === 'code' && (
          <div className={styles.previewPane}>
            <CodePreview projectName={project.name} />
          </div>
        )}

        {/* Run pane — real client-side execution, WASM-compiled projects only */}
        {tab === 'run' && (
          <div className={styles.previewPane}>
            <ShellRunner />
          </div>
        )}

        {/* Live pane — the deployed app, embedded */}
        {tab === 'live' && (
          <div className={`${styles.previewPane} ${styles.livePane}`}>
            <iframe
              src={project.live}
              title={`${project.name} — live`}
              className={styles.liveFrame}
              allow="clipboard-read; clipboard-write"
            />
          </div>
        )}

        {/* Footer */}
        <div className={styles.footer}>
          <div className={styles.footerLinks}>
            <a
              href={project.repo}
              target="_blank"
              rel="noreferrer"
              className={styles.repoLink}
            >
              {'</>'} view on GitHub ↗
            </a>
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noreferrer"
                className={styles.repoLink}
              >
                open live ↗
              </a>
            )}
          </div>
          <span className={styles.esc} onClick={onClose}>ESC to close</span>
        </div>
      </div>
    </div>
  )
}
