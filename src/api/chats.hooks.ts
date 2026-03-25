import { useQuery } from '@tanstack/react-query'
import { getChats, getMessages } from './chats.api'

export function useChats(assistantId?: string | null) {
  return useQuery({
    queryKey: ['chats', { assistantId: assistantId ?? null }],
    queryFn: () => getChats(assistantId),
  })
}

export function useMessages(chatId?: string | null) {
  return useQuery({
    queryKey: ['messages', { chatId: chatId ?? null }],
    queryFn: () => getMessages(chatId as string),
    enabled: Boolean(chatId),
  })
}

