import { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Projects from './components/Projects'
import Skills from './components/Skills'
import ContribGraph from './components/ContribGraph'
import Contact from './components/Contact'
import CliTerminal from './components/CliTerminal'
import styles from './App.module.css'

export default function App() {
  const [termOpen, setTermOpen]       = useState(false)
  const [cliProject, setCliProject]   = useState(null)

  // Ctrl+K / Cmd+K to open terminal
  useEffect(() => {
    function onKey(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault()
        setTermOpen(o => !o)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div className={styles.app}>
      <Navbar onOpenTerminal={() => setTermOpen(true)} />
      <main>
        <Hero onOpenProject={(name) => setCliProject(name)} />
        <Projects externalProject={cliProject} onClearExternal={() => setCliProject(null)} />
        <Skills />
        <ContribGraph />
        <Contact />
      </main>
      <footer className={styles.footer}>
        <span className={styles.prompt}>~</span>
        <span className={styles.muted}> © 2025 Bailey Scanlan — built with React + Vite</span>
        <button className={styles.termHint} onClick={() => setTermOpen(true)}>
          ctrl+k
        </button>
      </footer>

      <CliTerminal
        open={termOpen}
        onClose={() => setTermOpen(false)}
        onOpenProject={(name) => {
          setCliProject(name)
          setTermOpen(false)
        }}
      />
    </div>
  )
}
