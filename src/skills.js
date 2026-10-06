// Single source for skills — rendered by Skills.jsx and printed by `cat skills` in the CLI.
// level: 'proficient' | 'intermediate' | 'familiar'
export const SKILLS = {
  Languages: [
    { name: 'Python',     level: 'proficient' },
    { name: 'JavaScript', level: 'proficient' },
    { name: 'C',          level: 'proficient' },
    { name: 'HTML/CSS',   level: 'proficient' },
    { name: 'Java',       level: 'intermediate' },
    { name: 'Bash',       level: 'intermediate' },
    { name: 'R',          level: 'familiar' },
    { name: 'PowerShell', level: 'familiar' },
  ],
  'Frameworks & Libraries': [
    { name: 'Django',     level: 'proficient' },
    { name: 'React',      level: 'proficient' },
    { name: 'Flask',      level: 'intermediate' },
    { name: 'Node.js',    level: 'intermediate' },
    { name: 'Bootstrap',  level: 'intermediate' },
    { name: 'Pandas',     level: 'intermediate' },
    { name: 'PyTorch',    level: 'familiar' },
    { name: 'TensorFlow', level: 'familiar' },
  ],
  'Tools & Platforms': [
    { name: 'Git',        level: 'proficient' },
    { name: 'Linux',      level: 'proficient' },
    { name: 'Docker',     level: 'intermediate' },
    { name: 'Postman',    level: 'intermediate' },
    { name: 'Figma',      level: 'intermediate' },
    { name: 'Vite/Tauri', level: 'intermediate' },
  ],
}
