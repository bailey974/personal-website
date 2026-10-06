import { useState } from 'react'
import styles from './ProjectPreviews.module.css'

/* ─── 3rd-Year-Project: Collaborative Code Editor ──────────────────────── */
const CODE_LINES = [
  { n: 1,  tokens: [{ t: 'kw', v: 'import' }, { t: 'tx', v: ' asyncio' }] },
  { n: 2,  tokens: [] },
  { n: 3,  tokens: [{ t: 'kw', v: 'class' }, { t: 'cl', v: ' CollabSession' }, { t: 'tx', v: ':' }] },
  { n: 4,  tokens: [{ t: 'cm', v: '    """Real-time collaborative editor session."""' }] },
  { n: 5,  tokens: [] },
  { n: 6,  tokens: [{ t: 'tx', v: '    ' }, { t: 'kw', v: 'def' }, { t: 'fn', v: ' __init__' }, { t: 'tx', v: '(self, doc_id):' }] },
  { n: 7,  tokens: [{ t: 'tx', v: '        self.doc_id = doc_id' }] },
  { n: 8,  tokens: [{ t: 'tx', v: '        self.peers  = ' }, { t: 'kw', v: '[]' }] },
  { n: 9,  tokens: [{ t: 'tx', v: '        self.ydoc   = YDoc()' }] },
  { n: 10, tokens: [] },
  { n: 11, tokens: [{ t: 'tx', v: '    ' }, { t: 'kw', v: 'async def' }, { t: 'fn', v: ' sync' }, { t: 'tx', v: '(self, ws):' }] },
  { n: 12, tokens: [{ t: 'tx', v: '        state = self.ydoc.get_state()' }] },
  { n: 13, tokens: [{ t: 'tx', v: '        ' }, { t: 'kw', v: 'await' }, { t: 'tx', v: ' ws.send(state)' }] },
]

function CollabEditorPreview() {
  const [activeFile, setActiveFile] = useState('session.py')
  const files = ['session.py', 'ydoc.py', 'server.py']
  const users = [
    { name: 'bailey', color: '#3fb950', line: 8 },
    { name: 'alice',  color: '#58a6ff', line: 13 },
  ]

  return (
    <div className={styles.editor}>
      {/* Top bar */}
      <div className={styles.editorBar}>
        <span className={styles.editorLogo}>⬡ collab-editor</span>
        <div className={styles.editorTabs}>
          {files.map(f => (
            <button
              key={f}
              className={`${styles.editorTab} ${f === activeFile ? styles.editorTabActive : ''}`}
              onClick={() => setActiveFile(f)}
            >
              {f}
            </button>
          ))}
        </div>
        <div className={styles.onlinePips}>
          {users.map(u => (
            <span key={u.name} className={styles.pip} style={{ background: u.color }} title={u.name} />
          ))}
          <span className={styles.onlineCount}>{users.length} online</span>
        </div>
      </div>

      <div className={styles.editorBody}>
        {/* Sidebar */}
        <div className={styles.editorSide}>
          <div className={styles.sideSection}>EXPLORER</div>
          {files.map(f => (
            <div
              key={f}
              className={`${styles.sideFile} ${f === activeFile ? styles.sideFileActive : ''}`}
              onClick={() => setActiveFile(f)}
            >
              🐍 {f}
            </div>
          ))}
          <div className={styles.sideSection} style={{ marginTop: 16 }}>USERS</div>
          {users.map(u => (
            <div key={u.name} className={styles.sideUser}>
              <span className={styles.pip} style={{ background: u.color }} />
              {u.name}
            </div>
          ))}
        </div>

        {/* Code area */}
        <div className={styles.editorCode}>
          {CODE_LINES.map((line) => {
            const cursor = users.find(u => u.line === line.n)
            return (
              <div key={line.n} className={styles.codeLine}>
                <span className={styles.lineNum}>{line.n}</span>
                <span className={styles.lineBody}>
                  {line.tokens.map((tok, i) => (
                    <span key={i} className={styles[`tok_${tok.t}`]}>{tok.v}</span>
                  ))}
                  {cursor && (
                    <span
                      className={styles.cursorMarker}
                      style={{ background: cursor.color, boxShadow: `0 0 6px ${cursor.color}` }}
                      title={cursor.name}
                    />
                  )}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Status bar */}
      <div className={styles.statusBar}>
        <span style={{ color: '#3fb950' }}>⬡ Connected</span>
        <span>Python 3.11</span>
        <span>UTF-8</span>
        <span>Ln 13, Col 24</span>
      </div>
    </div>
  )
}

/* ─── Pizza-Haven ───────────────────────────────────────────────────────── */
const MENU = [
  { id: 1, name: 'Margherita',  price: 12.99, emoji: '🍕' },
  { id: 2, name: 'Pepperoni',   price: 14.99, emoji: '🍕' },
  { id: 3, name: 'BBQ Chicken', price: 15.99, emoji: '🍕' },
  { id: 4, name: 'Veggie',      price: 13.49, emoji: '🌿' },
]

function PizzaPreview() {
  const [cart, setCart] = useState({ 1: 1, 2: 1 })
  const [ordered, setOrdered] = useState(false)

  const add = (id) => setCart(c => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
  const remove = (id) => setCart(c => {
    const next = { ...c }
    if (next[id] > 1) next[id]--
    else delete next[id]
    return next
  })

  const total = Object.entries(cart).reduce((sum, [id, qty]) => {
    const item = MENU.find(m => m.id === Number(id))
    return sum + (item?.price ?? 0) * qty
  }, 0)

  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0)

  return (
    <div className={styles.pizza}>
      {/* Nav */}
      <div className={styles.pizzaNav}>
        <span className={styles.pizzaLogo}>🍕 Pizza Haven</span>
        <span className={styles.cartBadge}>🛒 {cartCount}</span>
      </div>

      <div className={styles.pizzaBody}>
        {/* Menu */}
        <div className={styles.pizzaMenu}>
          <div className={styles.pizzaMenuTitle}>Menu</div>
          {MENU.map(item => (
            <div key={item.id} className={styles.pizzaItem}>
              <span className={styles.pizzaEmoji}>{item.emoji}</span>
              <div className={styles.pizzaInfo}>
                <span className={styles.pizzaName}>{item.name}</span>
                <span className={styles.pizzaPrice}>€{item.price.toFixed(2)}</span>
              </div>
              <button className={styles.addBtn} onClick={() => add(item.id)}>+ Add</button>
            </div>
          ))}
        </div>

        {/* Cart */}
        <div className={styles.pizzaCart}>
          <div className={styles.pizzaMenuTitle}>Your Order</div>
          {Object.keys(cart).length === 0 && (
            <p className={styles.emptyCart}>Your cart is empty</p>
          )}
          {Object.entries(cart).map(([id, qty]) => {
            const item = MENU.find(m => m.id === Number(id))
            return (
              <div key={id} className={styles.cartItem}>
                <span className={styles.cartName}>{item.name}</span>
                <div className={styles.cartQty}>
                  <button className={styles.qtyBtn} onClick={() => remove(Number(id))}>−</button>
                  <span>{qty}</span>
                  <button className={styles.qtyBtn} onClick={() => add(Number(id))}>+</button>
                </div>
                <span className={styles.cartPrice}>€{(item.price * qty).toFixed(2)}</span>
              </div>
            )
          })}
          {Object.keys(cart).length > 0 && (
            <>
              <div className={styles.cartDivider} />
              <div className={styles.cartTotal}>
                <span>Total</span>
                <span>€{total.toFixed(2)}</span>
              </div>
              <button
                className={styles.orderBtn}
                onClick={() => setOrdered(true)}
              >
                {ordered ? '✓ Order Placed!' : 'Place Order'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ─── Shell ─────────────────────────────────────────────────────────────── */
const SHELL_HISTORY = [
  { cmd: 'ls', output: 'Documents  Downloads  Projects  README.md  shell' },
  { cmd: 'pwd', output: '/home/bailey/Shell' },
  { cmd: 'echo "Hello from my shell!"', output: 'Hello from my shell!' },
  { cmd: 'ls -la | grep shell', output: '-rwxr-xr-x 1 bailey users 24K Feb 20 shell' },
]

function ShellPreview() {
  const [history, setHistory] = useState(SHELL_HISTORY.slice(0, 2))
  const [input, setInput] = useState('')

  function run(e) {
    e.preventDefault()
    const trimmed = input.trim()
    if (!trimmed) return
    const known = SHELL_HISTORY.find(h => h.cmd === trimmed)
    const output = known
      ? known.output
      : `mysh: command not found: ${trimmed.split(' ')[0]}`
    setHistory(h => [...h, { cmd: trimmed, output }])
    setInput('')
  }

  return (
    <div className={styles.shell}>
      <div className={styles.shellBody}>
        {history.map((entry, i) => (
          <div key={i}>
            <div className={styles.shellLine}>
              <span className={styles.shellPrompt}>mysh&gt;</span>
              <span className={styles.shellCmd}> {entry.cmd}</span>
            </div>
            <div className={styles.shellOutput}>{entry.output}</div>
          </div>
        ))}

        <form onSubmit={run} className={styles.shellLine}>
          <span className={styles.shellPrompt}>mysh&gt;</span>
          <input
            className={styles.shellInput}
            value={input}
            onChange={e => setInput(e.target.value)}
            autoFocus
            spellCheck={false}
            placeholder="type a command…"
          />
        </form>
      </div>
      <div className={styles.shellHint}>
        Try: <code>ls</code>, <code>pwd</code>, <code>echo "Hello from my shell!"</code>, <code>ls -la | grep shell</code>
      </div>
    </div>
  )
}

/* ─── C_auto_compiler ───────────────────────────────────────────────────── */
const DEMO_FILES = ['hello.c', 'main.c', 'utils.c']

function CompilerPreview() {
  const [selected, setSelected] = useState(['hello.c'])
  const [output, setOutput] = useState(null)
  const [running, setRunning] = useState(false)

  function toggle(f) {
    setSelected(s => s.includes(f) ? s.filter(x => x !== f) : [...s, f])
    setOutput(null)
  }

  function compile() {
    if (!selected.length) return
    setRunning(true)
    setOutput(null)
    const lines = [
      `[INFO] Detected ${selected.length} source file(s): ${selected.join(', ')}`,
      `[INFO] Running: gcc -Wall -o ${selected[0].replace('.c','')} ${selected.join(' ')}`,
    ]
    setTimeout(() => {
      lines.push('[OK]   Compilation successful')
      lines.push(`[INFO] Output binary: ./${selected[0].replace('.c','')}`)
      setOutput(lines)
      setRunning(false)
    }, 1000)
  }

  function run() {
    setOutput(o => [...(o ?? []), '', `$ ./${selected[0].replace('.c','')}`, 'Hello, World!'])
  }

  return (
    <div className={styles.compiler}>
      <div className={styles.compilerPanel}>
        <div className={styles.compilerLabel}>Source Files</div>
        {DEMO_FILES.map(f => (
          <label key={f} className={styles.fileRow}>
            <input
              type="checkbox"
              checked={selected.includes(f)}
              onChange={() => toggle(f)}
              className={styles.checkbox}
            />
            <span className={styles.fileName}>📄 {f}</span>
          </label>
        ))}
        <button
          className={styles.compileBtn}
          onClick={compile}
          disabled={!selected.length || running}
        >
          {running ? 'Compiling…' : '⚙ Compile'}
        </button>
        {output && !running && (
          <button className={styles.runBtn} onClick={run}>
            ▶ Run
          </button>
        )}
      </div>

      <div className={styles.compilerOutput}>
        <div className={styles.compilerLabel}>Output</div>
        {!output && !running && (
          <span className={styles.outputPlaceholder}>Select files and compile…</span>
        )}
        {running && (
          <span className={styles.outputInfo}>[INFO] Compiling…</span>
        )}
        {output && output.map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith('[OK]')   ? styles.outputOk   :
              line.startsWith('[INFO]') ? styles.outputInfo  :
              line.startsWith('$')      ? styles.outputCmd   :
              styles.outputLine
            }
          >
            {line || '\u00A0'}
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─── Export map ─────────────────────────────────────────────────────────── */
export const PREVIEWS = {
  '3rd-Year-Project': CollabEditorPreview,
  'Pizza-Haven':      PizzaPreview,
  'Shell':            ShellPreview,
  'C_auto_compiler':  CompilerPreview,
}
