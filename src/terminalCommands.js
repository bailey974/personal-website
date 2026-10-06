// Shared command engine — used by both the Hero terminal and the Ctrl+K CliTerminal
// so the two stay in sync instead of maintaining two copies of the same commands.

export const PROJECTS = ['3rd-Year-Project', 'Pizza-Haven', 'Shell', 'C_auto_compiler']

export const SECTIONS = {
  about:    '#hero',
  hero:     '#hero',
  projects: '#projects',
  skills:   '#skills',
  contact:  '#contact',
}

export const HELP_TEXT = [
  { t: 'info', v: 'Available commands:' },
  { t: 'cmd',  v: '  whoami              — about me' },
  { t: 'cmd',  v: '  ls projects         — list projects' },
  { t: 'cmd',  v: '  open <project>      — open project modal' },
  { t: 'cmd',  v: '  cat skills          — print skills' },
  { t: 'cmd',  v: '  goto <section>      — scroll to section' },
  { t: 'cmd',  v: '  clear               — clear terminal' },
  { t: 'cmd',  v: '  easter-egg          — ???' },
  { t: 'cmd',  v: '  exit                — close terminal' },
]

export const SKILLS_TEXT = [
  { t: 'info', v: 'Languages:   Python █████████░ 90%  |  JavaScript ███████░░░ 75%' },
  { t: 'info', v: '             C      ███████░░░ 70%  |  Java       ██████░░░░ 65%' },
  { t: 'info', v: '             SQL    ███████░░░ 75%  |  Bash       ██████░░░░ 60%' },
  { t: 'info', v: 'Frameworks:  Django ███████░░░ 75%  |  React      ███████░░░ 70%' },
  { t: 'info', v: '             Flask  ██████░░░░ 60%  |  Node.js    █████░░░░░ 55%' },
  { t: 'info', v: 'Tools:       Git    ████████░░ 85%  |  Docker     ██████░░░░ 60%' },
  { t: 'info', v: '             Linux  ███████░░░ 70%  |  Postman    ██████░░░░ 65%' },
]

export const EASTER_EGG = [
  { t: 'grn', v: '⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣠⣤⣤⣤⣤⣤⣶⣦⣤⣄⡀⠀⠀⠀⠀⠀⠀⠀⠀' },
  { t: 'grn', v: '⠀⠀⠀⠀⠀⠀⠀⠀⢀⣴⣿⡿⠛⠉⠙⠛⠛⠛⠛⠻⢿⣿⣷⣤⡀⠀⠀⠀⠀⠀' },
  { t: 'grn', v: '⠀⠀⠀⠀⠀⠀⠀⠀⣼⣿⠋⠀⠀⠀⠀⠀⠀⠀⢀⣀⣀⠈⢻⣿⣿⡄⠀⠀⠀⠀' },
  { t: 'grn', v: '⠀⠀⠀⠀⠀⠀⠀⣸⣿⡏⠀⠀⠀⣠⣶⣾⣿⣿⣿⠿⠿⠿⢿⣿⣿⣿⣄⠀⠀⠀' },
  { t: 'grn', v: '⠀⠀⠀⠀⠀⠀⠀⣿⣿⠁⠀⠀⢰⣿⣿⣯⠁⠀⠀⠀⠀⠀⠀⠀⠈⠙⢿⣷⡄⠀' },
  { t: 'grn', v: '⠀⠀⣀⣤⣴⣶⣶⣿⡟⠀⠀⠀⢸⣿⣿⣿⣆⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣿⣷⠀' },
  { t: 'grn', v: '⠀⢰⣿⡟⠋⠉⣹⣿⡇⠀⠀⠀⠘⣿⣿⣿⣿⣷⣦⣤⣤⣤⣶⣶⣶⣶⣿⣿⣿⠀' },
  { t: 'grn', v: '⠀⢸⣿⡇⠀⠀⣿⣿⡇⠀⠀⠀⠀⠹⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠃⠀' },
  { t: 'grn', v: '⠀⣸⣿⡇⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠉⠻⠿⣿⣿⣿⣿⡿⠿⠿⠛⢻⣿⡇⠀⠀' },
  { t: 'grn', v: '⠀⣿⣿⠁⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣧⠀⠀' },
  { t: 'grn', v: '⠀⣿⣿⠀⠀⠀⣿⣿⡇⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⢸⣿⣿⠀⠀' },
  { t: 'info', v: '' },
  { t: 'info', v: "you found it. here's a cookie: 🍪" },
]

export function runCommand(raw, onOpen) {
  const trimmed = raw.trim()
  if (!trimmed) return []

  const lower = trimmed.toLowerCase()
  const [cmd, ...args] = lower.split(/\s+/)

  if (cmd === 'help') return HELP_TEXT

  if (cmd === 'whoami' || cmd === 'about') {
    return [
      { t: 'info', v: 'Bailey Scanlan' },
      { t: 'info', v: 'Computer Science Student & Software Dev Intern' },
      { t: 'info', v: 'Dublin, Ireland' },
      { t: 'info', v: 'github.com/bailey974  |  leetcode.com/u/scanlab5' },
    ]
  }

  if (cmd === 'ls') {
    if (args[0] === 'projects' || args[0] === 'projects/') {
      return [
        { t: 'info', v: 'total 4' },
        ...PROJECTS.map(p => ({ t: 'grn', v: `drwxr-xr-x  ${p}/` })),
      ]
    }
    return [{ t: 'err', v: `ls: unknown argument '${args.join(' ')}'. Try: ls projects` }]
  }

  if (cmd === 'open') {
    const query = args.join('-').toLowerCase()
    const match = PROJECTS.find(p => p.toLowerCase().includes(query) || query.includes(p.toLowerCase().replace(/_/g, '-')))
    if (match) {
      onOpen(match)
      return [{ t: 'grn', v: `opening ${match}…` }]
    }
    return [
      { t: 'err', v: `project not found: '${args.join(' ')}'` },
      { t: 'info', v: `available: ${PROJECTS.join(', ')}` },
    ]
  }

  if (cmd === 'cat') {
    if (args[0] === 'skills' || args[0] === 'skills.json') return SKILLS_TEXT
    return [{ t: 'err', v: `cat: no such file '${args.join(' ')}'. Try: cat skills` }]
  }

  if (cmd === 'goto' || cmd === 'cd') {
    const dest = args[0]
    const href = SECTIONS[dest]
    if (href) {
      document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
      return [{ t: 'grn', v: `scrolling to ${dest}…` }]
    }
    return [
      { t: 'err', v: `unknown section: '${dest}'` },
      { t: 'info', v: `available: ${Object.keys(SECTIONS).join(', ')}` },
    ]
  }

  if (cmd === 'clear') return [{ t: 'clear' }]

  if (cmd === 'easter-egg' || cmd === 'easteregg') return EASTER_EGG

  if (cmd === 'exit' || cmd === 'quit') return [{ t: 'exit' }]

  return [{ t: 'err', v: `command not found: ${cmd}. type 'help' for a list of commands.` }]
}
