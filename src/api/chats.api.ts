import { api } from '../shared/config/api'

export type Chat = {
  id: string
  assistantId?: string | null
  lastMessage?: string | null
  updatedAt?: string | null
  createdAt?: string | null
}

export type ChatMessage = {
  id?: string
  chatId: string
  role: 'user' | 'assistant'
  content: string
  createdAt?: string | null
}

export async function getChats(assistantId?: string | null): Promise<Chat[]> {
  const res = await api.get('/chats', {
    params: assistantId ? { assistantId } : undefined,
  })
  return res.data
}

export async function getMessages(chatId: string): Promise<ChatMessage[]> {
  const res = await api.get('/messages', { params: { chatId } })
  return res.data
}

