import { getAssistants } from './assistants.api'
import { getChats, getMessages } from './chats.api'

export type Analytics = {
  totalChats: number
  totalMessages: number
  activeAssistants: number
}

const CHAT_SAMPLE_LIMIT = 30

async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  let idx = 0

  async function worker() {
    while (idx < items.length) {
      const current = idx
      idx += 1
      results[current] = await fn(items[current])
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, () => worker()))
  return results
}

export async function getAnalytics(): Promise<Analytics> {
  const [chats, assistants] = await Promise.all([getChats(null), getAssistants()])

  const sampledChats = chats.slice(0, CHAT_SAMPLE_LIMIT)

  const messageCounts = await mapLimit(
    sampledChats,
    5,
    async (c) => {
      try {
        return (await getMessages(c.id)).length
      } catch {
        return 0
      }
    },
  )

  return {
    totalChats: chats.length,
    totalMessages: messageCounts.reduce((a, b) => a + b, 0),
    activeAssistants: assistants.length,
  }
}

