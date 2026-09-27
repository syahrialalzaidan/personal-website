export const overview = [
  'I’m Iyal. I treat software like a long rally: stay patient, keep the ball in play, and pick the right moment to go for the line.',
  'Right now I build GoFood backend services at GoTo. Before that I spent a year on agentic AI infrastructure — memory, retrieval, orchestration — for an AI agents marketplace.',
]

/** Headline numbers count up on reveal; a `text` stat shows as-is instead. */
export const stats = [
  { text: 'Cum laude', label: 'Graduated ITB' },
  { value: 5, decimals: 0, suffix: '', label: 'Teams shipped with' },
  { value: 4, decimals: 0, suffix: '', label: 'Hackathon honors' },
  { value: 2, decimals: 0, suffix: '+', label: 'Years in production' },
] as const

export const kitBag = [
  { pocket: 'Languages', items: ['Go', 'Clojure', 'TypeScript', 'Python', 'C'] },
  { pocket: 'Frameworks', items: ['Next.js', 'React', 'React Native', 'Express', 'GoFiber'] },
  { pocket: 'Data', items: ['PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'Prisma'] },
  { pocket: 'Infra', items: ['Docker', 'Kubernetes', 'GCP', 'AWS Amplify', 'CI/CD'] },
  { pocket: 'AI', items: ['Agents', 'RAG', 'Memory', 'LLM evals', 'Qwen · Llama'] },
]

export const education = {
  school: 'Institut Teknologi Bandung',
  degree: 'B.Sc. Information Systems and Technology',
  period: '2021 — 2025',
  honors: 'Cum laude',
  credits: '152 credits',
}

export const clubhouse = [
  {
    role: 'Core team',
    org: 'Google Developer Student Clubs ITB',
    period: 'Aug 2023 — Jun 2024',
    detail: 'Ran tech events and a 1,000-member Discord community.',
  },
  {
    role: 'Deputy head of extracampus',
    org: 'HMIF ITB',
    period: 'Apr 2023 — Apr 2024',
    detail: 'Reworked external relations; created HMIF Goes Out (Tiket.com, SeaBank).',
  },
]

export const languages = [
  { name: 'Indonesian', level: 'Native' },
  { name: 'English', level: 'Professional' },
]
