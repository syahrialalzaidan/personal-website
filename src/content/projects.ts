import type { Replay } from './types'

export const replays: Replay[] = [
  {
    id: 'becreatives',
    title: 'BeCreatives',
    context: 'AI agent · Creative platform',
    summary:
      'An AI agent inside the BeCreatives platform that helps people ideate, and lets them see and steer what it remembers.',
    highlights: [
      'Integrated a personal AI agent into ideation workflows.',
      'Designed an agentic memory system that keeps context across sessions.',
      'Gave users direct control over the agent’s memory.',
    ],
    tags: ['AI agents', 'Memory', 'Product'],
    link: { label: 'Visit BeCreatives', href: 'https://space.becreatives.co/' },
    readout: { speed: 184, spin: 2890, margin: '3 mm' },
    shot: { from: [22, 96], bounce: [80, 18], apex: 44 },
  },
  {
    id: 'callmesensei',
    title: 'CallMeSensei',
    context: 'Mobile app · Learning',
    summary:
      'A React Native learning app with an agentic AI tutor that adapts to each learner’s journey.',
    highlights: [
      'Built and iterated on core app features in React Native.',
      'Integrated a personalized, context-aware agentic AI feature.',
    ],
    tags: ['React Native', 'Agentic AI', 'Mobile'],
    link: { label: 'Visit CallMeSensei', href: 'https://www.callmesensei.app/' },
    readout: { speed: 171, spin: 3210, margin: '8 mm' },
    shot: { from: [78, 96], bounce: [24, 22], apex: 38 },
  },
  {
    id: 'iris',
    title: 'IRIS',
    context: 'Garuda Hacks 5.0 · 2nd place',
    summary:
      'A mobile app that uses AI to help prevent and respond to domestic violence and sexual assault. Built in 36 hours.',
    highlights: [
      '2nd of 380+ participants at an international offline hackathon.',
      'AI features for safety and faster response when it matters.',
    ],
    tags: ['Mobile', 'AI', 'Safety'],
    link: { label: 'View IRIS on Devpost', href: 'https://devpost.com/software/iris-fprvg9' },
    readout: { speed: 196, spin: 2410, margin: '1 mm' },
    shot: { from: [50, 98], bounce: [50, 14], apex: 50 },
  },
  {
    id: 'ride-safety',
    title: 'Ride Safety Intelligence',
    context: 'Alibaba Cloud GenAI Hackathon · Top 4',
    summary:
      'AI safety intelligence for transport rides, built in 24 hours on almost entirely Alibaba Cloud.',
    highlights: [
      'Risk Assessment and Summarizer agents on Qwen Plus.',
      'Speech-to-text, PAI-EAS, PAI-DSW, OSS, ApsaraDB RDS and AnalyticDB.',
      'Honorable mention out of ~2,000 participants.',
    ],
    tags: ['Qwen', 'Multi-agent', 'Alibaba Cloud'],
    link: {
      label: 'Read the Alibaba Cloud feature',
      href: 'https://www.alibabacloud.com/blog/goshield-ai-powered-passenger-safety-built-for-the-realities-of-everyday-rides_602373',
    },
    readout: { speed: 177, spin: 3560, margin: '5 mm' },
    shot: { from: [30, 97], bounce: [88, 30], apex: 34 },
  },
]
