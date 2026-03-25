import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import { io, type Socket } from 'socket.io-client'
import { useChats, useMessages } from '../api/chats.hooks'
import type { Chat, ChatMessage } from '../api/chats.api'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { API_URL } from '../shared/config/api'
import { Input } from '../shared/ui/Input'
import { useAuthStore } from '../store/auth.store'
import { useToastStore } from '../store/toast.store'

export function ChatsPage() {
  const toast = useToastStore((s) => s.push)
  const token = useAuthStore((s) => s.token)

  const [assistantId, setAssistantId] = useState<string>('')
  const [activeChatId, setActiveChatId] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  const [apiKey, setApiKey] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [isAssistantTyping, setIsAssistantTyping] = useState(false)

  const chats = useChats(assistantId.trim() ? assistantId.trim() : null)
  const messagesQuery = useMessages(activeChatId)

  const [liveMessages, setLiveMessages] = useState<ChatMessage[] | null>(null)
  const messages: ChatMessage[] = liveMessages ?? messagesQuery.data ?? []

  const bottomRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const socketRef = useRef<Socket | null>(null)

  const chatList: Chat[] = useMemo(() => {
    const list = (chats.data ?? []) as Chat[]
    return [...list].sort((a, b) => {
      const ta = Date.parse((a.updatedAt ?? a.createdAt ?? '') as string) || 0
      const tb = Date.parse((b.updatedAt ?? b.createdAt ?? '') as string) || 0
      return tb - ta
    })
  }, [chats.data])

  useEffect(() => {
    const s = io(API_URL, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      auth: token ? { token } : undefined,
    })
    socketRef.current = s

    s.on('connect_error', () => {
      // avoid spam; show only once per mount
      toast({ type: 'error', title: 'Realtime connection failed' })
    })

    s.on('chat:token', (payload: { chatId?: string; token?: string; content?: string }) => {
      const incomingChatId = payload?.chatId
      if (!incomingChatId || incomingChatId !== activeChatId) return
      const tokenChunk = payload?.token ?? payload?.content ?? ''
      if (!tokenChunk) return

      setIsAssistantTyping(true)
      setLiveMessages((prev) => {
        const base = prev ?? messagesQuery.data ?? []
        const next = [...base]
        const last = next[next.length - 1]
        if (last && last.role === 'assistant') {
          next[next.length - 1] = { ...last, content: `${last.content}${tokenChunk}` }
        } else {
          next.push({ chatId: incomingChatId, role: 'assistant', content: tokenChunk })
        }
        return next
      })

      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    })

    s.on('chat:done', (payload: { chatId?: string }) => {
      if (payload?.chatId && payload.chatId !== activeChatId) return
      setLiveMessages(null)
      setIsAssistantTyping(false)
      setIsSending(false)
      scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    })

    return () => {
      s.disconnect()
      socketRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages.length])

  useEffect(() => {
    if (!activeChatId && chatList.length > 0) {
      setActiveChatId(chatList[0].id)
    }
  }, [activeChatId, chatList])

  useEffect(() => {
    setLiveMessages(null)
    setIsAssistantTyping(false)
    setIsSending(false)
  }, [activeChatId])

  function formatTime(value?: string | null) {
    if (!value) return ''
    const t = Date.parse(value)
    if (!Number.isFinite(t)) return value
    return new Date(t).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  async function onSend(e: React.FormEvent) {
    e.preventDefault()
    if (isSending) return
    const message = draft.trim()
    if (!message || !activeChatId) return

    if (!apiKey.trim()) {
      toast({ type: 'error', title: 'API key is required to send messages' })
      return
    }

    setIsSending(true)
    setIsAssistantTyping(true)
    setDraft('')
    const userMsg: ChatMessage = { chatId: activeChatId, role: 'user', content: message, createdAt: new Date().toISOString() }
    setLiveMessages((prev) => ([...(prev ?? messagesQuery.data ?? []), userMsg]))

    try {
      socketRef.current?.emit('chat:message', { message, chatId: activeChatId, apiKey: apiKey.trim() })
      socketRef.current?.emit('chat:typing', { chatId: activeChatId })
    } catch {
      toast({ type: 'error', title: 'Could not send message' })
      setIsSending(false)
      setIsAssistantTyping(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Chats</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Conversations, history, and context management</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Threads" description="Select a conversation" className="lg:col-span-1">
            <div className="space-y-3">
              <Input
                label="Assistant ID (optional)"
                placeholder="Filter chats by assistantId"
                value={assistantId}
                onChange={(e) => setAssistantId(e.target.value)}
              />

              {chats.isLoading ? (
                <div className="space-y-3 pt-2">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-14 animate-pulse rounded-2xl border border-white/10 bg-slate-950/30" />
                  ))}
                </div>
              ) : chats.isError ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
                  Could not load chats.
                </div>
              ) : chatList.length === 0 ? (
                <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-sm text-slate-300">
                  No chats yet.
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  {chatList.map((c) => {
                    const isActive = c.id === activeChatId
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => setActiveChatId(c.id)}
                        className={[
                          'w-full rounded-2xl border px-4 py-3 text-left transition',
                          isActive
                            ? 'border-white/20 bg-white/10'
                            : 'border-white/10 bg-slate-950/30 hover:border-white/20 hover:bg-white/5',
                        ].join(' ')}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="truncate text-sm font-medium text-white">Chat {c.id.slice(0, 8)}</div>
                            <div className="mt-1 truncate text-xs text-slate-300">
                              {c.lastMessage ?? 'No messages yet'}
                            </div>
                          </div>
                          <div className="shrink-0 text-xs text-slate-400">{formatTime(c.updatedAt ?? c.createdAt)}</div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </Card>

          <Card
            title="Conversation"
            description={activeChatId ? `Chat ${activeChatId}` : 'Pick a chat to start'}
            className="lg:col-span-2"
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <Input
                  label="API key"
                  placeholder="Required for chat:message"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>

              <div className="h-[420px] overflow-y-auto rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                {messagesQuery.isLoading && activeChatId ? (
                  <div className="space-y-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="h-10 animate-pulse rounded-2xl border border-white/10 bg-slate-950/30" />
                    ))}
                  </div>
                ) : messagesQuery.isError ? (
                  <div className="text-sm text-slate-300">Could not load messages.</div>
                ) : activeChatId && messages.length === 0 ? (
                  <div className="text-sm text-slate-300">No messages yet.</div>
                ) : (
                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {messages.map((m, idx) => (
                        <motion.div
                          key={m.id ?? `${m.role}_${idx}`}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.14 }}
                          className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}
                        >
                          <div
                            className={[
                              'max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
                              m.role === 'user'
                                ? 'bg-indigo-500/20 text-white ring-1 ring-indigo-500/20'
                                : 'bg-white/5 text-slate-100 ring-1 ring-white/10',
                            ].join(' ')}
                          >
                            <div className="whitespace-pre-wrap">{m.content}</div>
                            {m.createdAt ? (
                              <div className="mt-2 text-[11px] text-slate-300/70">{formatTime(m.createdAt)}</div>
                            ) : null}
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                    {isAssistantTyping ? (
                      <motion.div
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.14 }}
                        className="flex justify-start"
                      >
                        <div className="max-w-[80%] rounded-2xl bg-white/5 px-4 py-3 text-sm text-slate-200 ring-1 ring-white/10">
                          Assistant is typing…
                        </div>
                      </motion.div>
                    ) : null}
                    <div ref={bottomRef} />
                    <div ref={scrollRef} />
                  </div>
                )}
              </div>

              <form className="flex items-end gap-3" onSubmit={onSend}>
                <div className="flex-1">
                  <Input
                    label="Message"
                    placeholder={activeChatId ? 'Type your message…' : 'Select a chat first'}
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    disabled={!activeChatId}
                  />
                </div>
                <Button type="submit" variant="primary" disabled={!activeChatId || !draft.trim() || isSending}>
                  {isSending ? 'Sending…' : 'Send'}
                </Button>
              </form>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
