import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useCreateDocument, useDeleteDocument, useDocuments } from '../api/documents.hooks'
import type { Document, DocumentType } from '../api/documents.api'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { Input } from '../shared/ui/Input'
import { useToastStore } from '../store/toast.store'

function formatDate(value?: string | null) {
  if (!value) return ''
  const t = Date.parse(value)
  if (!Number.isFinite(t)) return value
  return new Date(t).toLocaleString()
}

function chunksCount(doc: Document) {
  if (typeof doc.chunksCount === 'number') return doc.chunksCount
  if (Array.isArray(doc.chunks)) return doc.chunks.length
  return null
}

export function DocumentsPage() {
  const toast = useToastStore((s) => s.push)

  const [assistantId, setAssistantId] = useState('')
  const [isOpen, setIsOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [type, setType] = useState<DocumentType>('manual')
  const [content, setContent] = useState('')

  const assistantIdValue = assistantId.trim() ? assistantId.trim() : null

  const docsQuery = useDocuments(assistantIdValue)
  const createDoc = useCreateDocument()
  const deleteDoc = useDeleteDocument()

  const docs = useMemo(() => {
    const list = docsQuery.data ?? []
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [docsQuery.data])

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!assistantIdValue) {
      toast({ type: 'error', title: 'Укажите ID ассистента' })
      return
    }
    const t = title.trim()
    const c = content.trim()
    if (!t || !c) return

    try {
      await createDoc.mutateAsync({ assistantId: assistantIdValue, title: t, type, content: c })
      toast({ type: 'success', title: 'Документ добавлен' })
      setTitle('')
      setContent('')
      setType('manual')
      setIsOpen(false)
    } catch {
      toast({ type: 'error', title: 'Не удалось создать документ' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">База знаний</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Документы ассистента для поиска ответов</p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setIsOpen(true)
              setTitle('')
              setContent('')
              setType('manual')
            }}
            disabled={createDoc.isPending || deleteDoc.isPending}
          >
            Добавить документ
          </Button>
        </div>

        <Card title="Ассистент" description="Выберите ассистента для документов">
          <Input
            label="ID ассистента"
            placeholder="Вставьте assistantId"
            value={assistantId}
            onChange={(e) => setAssistantId(e.target.value)}
          />
        </Card>

        {!assistantIdValue ? (
          <Card title="Документы" description="Ассистент не выбран">
            <div className="text-sm text-slate-300">Введите ID ассистента, чтобы управлять документами.</div>
          </Card>
        ) : docsQuery.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[156px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              />
            ))}
          </div>
        ) : docsQuery.isError ? (
          <Card title="Документы" description="Не удалось загрузить">
            <div className="text-sm text-slate-300">Попробуйте обновить страницу чуть позже.</div>
          </Card>
        ) : docs.length === 0 ? (
          <Card title="Документы" description="Пока пусто">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-300">Добавьте документ — ответы станут точнее.</div>
              <Button variant="primary" onClick={() => setIsOpen(true)}>
                Добавить документ
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {docs.map((d) => {
              const count = chunksCount(d)
              return (
                <motion.div
                  key={d.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                  className="group rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold tracking-tight text-white">{d.title}</div>
                        <div className="mt-1 text-xs text-slate-300">
                          {d.type} • Создан {formatDate(d.createdAt)}
                        </div>
                        {typeof count === 'number' ? (
                          <div className="mt-3 inline-flex items-center rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-1.5 text-xs text-slate-200">
                            {count} фрагм.
                          </div>
                        ) : null}
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={deleteDoc.isPending || createDoc.isPending}
                        onClick={() => {
                          if (!window.confirm('Удалить этот документ?')) return
                          deleteDoc.mutate(d.id, {
                            onSuccess: () => toast({ type: 'success', title: 'Документ удалён' }),
                            onError: () => toast({ type: 'error', title: 'Не удалось удалить документ' }),
                          })
                        }}
                      >
                        Удалить
                      </Button>
                    </div>
                  </div>

                  <div className="h-1 w-full opacity-0 transition group-hover:opacity-100">
                    <div className="h-full w-full bg-gradient-to-r from-indigo-500/50 via-cyan-400/30 to-transparent" />
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.button
              type="button"
              className="absolute inset-0 bg-black/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-slate-950/60 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            >
              <div className="border-b border-white/10 p-6">
                <div className="text-sm font-semibold tracking-tight text-white">Новый документ</div>
                <div className="mt-1 text-xs text-slate-300">Текст разбивается на фрагменты для поиска (RAG).</div>
              </div>

              <form className="space-y-4 p-6" onSubmit={onCreate}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input label="Заголовок" placeholder="Политика цен" value={title} onChange={(e) => setTitle(e.target.value)} />

                  <label className="block">
                    <div className="text-sm text-slate-200">Тип</div>
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value as DocumentType)}
                      className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/20 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="manual">manual</option>
                      <option value="file">file</option>
                      <option value="url">url</option>
                    </select>
                  </label>
                </div>

                <label className="block">
                  <div className="text-sm text-slate-200">Содержание</div>
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Вставьте текст базы знаний…"
                    rows={8}
                    className="mt-1 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white/90 outline-none placeholder:text-slate-500 focus:border-white/20 focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <div className="mt-1 text-xs text-slate-400">Короткие абзацы дают лучший поиск.</div>
                </label>

                <div className="flex items-center justify-end gap-2">
                  <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={createDoc.isPending}>
                    Отмена
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    disabled={createDoc.isPending || !assistantIdValue || !title.trim() || !content.trim()}
                  >
                    {createDoc.isPending ? 'Добавление…' : 'Добавить'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

