import { useEffect, useState } from 'react'
import styles from './CodePreview.module.css'

// Real source files for each project, bundled at build time from
// src/projectSources/<ProjectName>/... — see that folder for how they got there.
// Lazy (no `eager`) so file contents code-split into on-demand chunks instead
// of bloating the main bundle with source nobody may ever look at.
const fileLoaders = import.meta.glob('/src/projectSources/*/**/*', {
  query: '?raw',
  import: 'default',
})

// projectName -> ['relative/path.ext', ...] — just the paths, known statically
// at build time, so the file tree/sidebar never has to wait on a network or a chunk load.
const PROJECT_PATHS = {}
for (const fullPath of Object.keys(fileLoaders)) {
  const rel = fullPath.replace('/src/projectSources/', '')
  const slash = rel.indexOf('/')
  const projectName = rel.slice(0, slash)
  const filePath = rel.slice(slash + 1)
  ;(PROJECT_PATHS[projectName] ??= []).push(filePath)
}
for (const list of Object.values(PROJECT_PATHS)) list.sort()

// Pick a good default file to open first
function pickDefault(files) {
  const priority = ['views.py', 'models.py', 'shell.c', 'auto_compiler.py', 'main.py', 'main.c', 'manage.py', 'README.md']
  for (const name of priority) {
    const match = files.find(f => f.endsWith('/' + name) || f === name)
    if (match) return match
  }
  return files[0]
}

export default function CodePreview({ projectName }) {
  const files = PROJECT_PATHS[projectName] ?? []
  const [selected, setSelected]     = useState(() => pickDefault(files) ?? null)
  const [code, setCode]             = useState(null)
  const [codeStatus, setCodeStatus] = useState('idle') // 'idle' | 'loading' | 'ok' | 'error'

  useEffect(() => {
    if (!selected) return
    let cancelled = false
    setCodeStatus('loading')
    setCode(null)

    const load = fileLoaders[`/src/projectSources/${projectName}/${selected}`]
    if (!load) {
      setCodeStatus('error')
      return
    }

    load().then(text => {
      if (!cancelled) {
        setCode(text)
        setCodeStatus('ok')
      }
    }).catch(() => {
      if (!cancelled) setCodeStatus('error')
    })

    return () => { cancelled = true }
  }, [selected, projectName])

  const lines = code?.split('\n') ?? []

  // Group files by directory for the sidebar
  const grouped = {}
  for (const f of files) {
    const parts = f.split('/')
    const dir = parts.length > 1 ? parts.slice(0, -1).join('/') : '.'
    if (!grouped[dir]) grouped[dir] = []
    grouped[dir].push(f)
  }

  return (
    <div className={styles.root}>
      {/* Sidebar */}
      <div className={styles.sidebar}>
        {files.length === 0 && (
          <div className={styles.sideStateErr}>no source files bundled</div>
        )}
        {Object.entries(grouped).map(([dir, dirFiles]) => (
          <div key={dir}>
            {dir !== '.' && (
              <div className={styles.dirLabel}>{dir}/</div>
            )}
            {dirFiles.map(f => {
              const name = f.split('/').pop()
              return (
                <button
                  key={f}
                  className={`${styles.fileBtn} ${selected === f ? styles.fileBtnActive : ''}`}
                  onClick={() => setSelected(f)}
                  title={f}
                >
                  {name}
                </button>
              )
            })}
          </div>
        ))}
      </div>

      {/* Code panel */}
      <div className={styles.panel}>
        {/* Breadcrumb bar */}
        <div className={styles.bar}>
          <span className={styles.filePath}>{selected ?? ''}</span>
        </div>

        {/* Content */}
        <div className={styles.body}>
          {codeStatus === 'error' && (
            <div className={styles.sideStateErr}>failed to load file</div>
          )}
          {codeStatus === 'ok' && lines.map((line, i) => (
            <div key={i} className={styles.line}>
              <span className={styles.lineNum}>{i + 1}</span>
              <span className={styles.lineText}>{line || ' '}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
