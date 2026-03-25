import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useCreateAssistant, useDeleteAssistant, useAssistants } from '../api/assistants.hooks'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { Input } from '../shared/ui/Input'
import { useToastStore } from '../store/toast.store'

export function AssistantsPage() {
  const assistants = useAssistants()
  const createAssistant = useCreateAssistant()
  const deleteAssistant = useDeleteAssistant()
  const toast = useToastStore((s) => s.push)

  const [isCreateOpen, setIsCreateOpen] = useState(false)
  const [name, setName] = useState('')

  const sorted = useMemo(() => {
    const list = assistants.data ?? []
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [assistants.data])

  async function onCreateSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return
    try {
      await createAssistant.mutateAsync({ name: trimmed })
      toast({ type: 'success', title: 'Ассистент создан' })
      setName('')
      setIsCreateOpen(false)
    } catch {
      toast({ type: 'error', title: 'Не удалось создать ассистента' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Ассистенты</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Настраивайте и подключайте AI-ассистентов</p>
          </div>
          <Button
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            disabled={assistants.isLoading || createAssistant.isPending || deleteAssistant.isPending}
          >
            + Создать ассистента
          </Button>
        </div>

        {assistants.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[132px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              />
            ))}
          </div>
        ) : assistants.isError ? (
          <Card title="Ассистенты" description="Сейчас список недоступен">
            <div className="text-sm text-slate-300">Попробуйте обновить страницу через минуту.</div>
          </Card>
        ) : sorted.length === 0 ? (
          <Card title="Ассистенты" description="Создайте первого ассистента">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-300">У вас пока нет ассистентов</div>
              <Button variant="primary" onClick={() => setIsCreateOpen(true)}>
                Создать ассистента
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {sorted.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold tracking-tight text-white">{a.name}</div>
                      <div className="mt-1 text-xs text-slate-300">
                        Создан{' '}
                        {Number.isFinite(Date.parse(a.createdAt))
                          ? new Date(a.createdAt).toLocaleString()
                          : a.createdAt}
                      </div>
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deleteAssistant.isPending || createAssistant.isPending}
                      onClick={() => {
                        deleteAssistant.mutate(a.id, {
                          onSuccess: () => toast({ type: 'success', title: 'Ассистент удалён' }),
                          onError: () => toast({ type: 'error', title: 'Не удалось удалить ассистента' }),
                        })
                      }}
                      className="opacity-80 hover:opacity-100"
                    >
                      Удалить
                    </Button>
                  </div>

                  <div className="mt-5 h-[1px] w-full bg-white/10" />

                  <div className="mt-4 text-xs text-slate-300">
                    Готов к сценариям, промптам и виджету.
                  </div>
                </div>

                <div className="h-1 w-full opacity-0 transition group-hover:opacity-100">
                  <div className="h-full w-full bg-gradient-to-r from-indigo-500/50 via-cyan-400/30 to-transparent" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <AnimatePresence>
        {isCreateOpen ? (
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
              onClick={() => setIsCreateOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/60 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            >
              <div className="border-b border-white/10 p-6">
                <div className="text-sm font-semibold tracking-tight text-white">Новый ассистент</div>
                <div className="mt-1 text-xs text-slate-300">Укажите понятное имя — его можно изменить позже.</div>
              </div>

              <form className="space-y-4 p-6" onSubmit={onCreateSubmit}>
                <Input
                  label="Имя"
                  placeholder="Мой ассистент"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />

                {createAssistant.isError ? (
                  <div className="text-sm text-rose-300">Не удалось создать. Попробуйте снова.</div>
                ) : null}

                <div className="flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setIsCreateOpen(false)}
                    disabled={createAssistant.isPending}
                  >
                    Отмена
                  </Button>
                  <Button type="submit" variant="primary" disabled={createAssistant.isPending || !name.trim()}>
                    {createAssistant.isPending ? 'Создание…' : 'Создать'}
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
