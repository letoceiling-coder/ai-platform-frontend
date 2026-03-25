import { create } from 'zustand'

export type BehaviorStateKey = 'greeting' | 'qualification' | 'offer' | 'close'

export type BehaviorStep = {
  key: BehaviorStateKey
  title: string
  prompt: string
  collapsed: boolean
}

export type BehaviorDefinition = {
  assistantId: string
  steps: BehaviorStep[]
  updatedAt: string
}

type BehaviorStore = {
  get: (assistantId: string) => BehaviorDefinition | null
  save: (def: BehaviorDefinition) => void
  reset: (assistantId: string) => BehaviorDefinition
}

const STORAGE_PREFIX = 'assistant.behavior.'

export function defaultBehaviorSteps(): BehaviorStep[] {
  return [
    { key: 'greeting', title: 'Greeting', prompt: '', collapsed: false },
    { key: 'qualification', title: 'Qualification', prompt: '', collapsed: false },
    { key: 'offer', title: 'Offer', prompt: '', collapsed: false },
    { key: 'close', title: 'Close', prompt: '', collapsed: false },
  ]
}

function keyFor(assistantId: string) {
  return `${STORAGE_PREFIX}${assistantId}`
}

export const useBehaviorStore = create<BehaviorStore>(() => ({
  get: (assistantId) => {
    try {
      const raw = localStorage.getItem(keyFor(assistantId))
      if (!raw) return { assistantId, steps: defaultBehaviorSteps(), updatedAt: new Date().toISOString() }
      const parsed = JSON.parse(raw) as BehaviorDefinition
      if (!parsed?.assistantId || !Array.isArray(parsed.steps)) {
        return { assistantId, steps: defaultBehaviorSteps(), updatedAt: new Date().toISOString() }
      }
      return parsed
    } catch {
      return { assistantId, steps: defaultBehaviorSteps(), updatedAt: new Date().toISOString() }
    }
  },
  save: (def) => {
    try {
      localStorage.setItem(keyFor(def.assistantId), JSON.stringify(def))
    } catch {
      // ignore storage failures
    }
  },
  reset: (assistantId) => {
    const def: BehaviorDefinition = { assistantId, steps: defaultBehaviorSteps(), updatedAt: new Date().toISOString() }
    try {
      localStorage.setItem(keyFor(assistantId), JSON.stringify(def))
    } catch {
      // ignore storage failures
    }
    return def
  },
}))

