import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useAssistants } from '../api/assistants.hooks'
import type { Assistant } from '../api/assistants.api'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { useBehaviorStore, type BehaviorStep } from '../store/behavior.store'
import { useToastStore } from '../store/toast.store'

function textareaClassName() {
  return [
    'mt-3 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-3 text-sm text-white/90 outline-none',
    'placeholder:text-slate-500 focus:border-white/20 focus:ring-2 focus:ring-indigo-500/20',
    'max-h-64 overflow-auto',
  ].join(' ')
}

export function BehaviorPage() {
  const toast = useToastStore((s) => s.push)
  const assistants = useAssistants()
  const behavior = useBehaviorStore()

  const assistantOptions = useMemo(() => {
    const list = (assistants.data ?? []) as Assistant[]
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [assistants.data])

  const [assistantId, setAssistantId] = useState<string>('')
  const [steps, setSteps] = useState<BehaviorStep[] | null>(null)
  const [isJsonOpen, setIsJsonOpen] = useState(false)

  const selectedId = assistantId.trim() || (assistantOptions[0]?.id ?? '')

  // Load from local storage when assistant changes
  useEffect(() => {
    if (!selectedId) return
    setAssistantId(selectedId)
    const def = behavior.get(selectedId)
    setSteps(def?.steps ?? null)
  }, [behavior, selectedId])

  const currentSteps = steps ?? []

  function move(index: number, dir: -1 | 1) {
    const next = [...currentSteps]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    const tmp = next[index]
    next[index] = next[target]
    next[target] = tmp
    setSteps(next)
  }

  function toggleCollapsed(index: number) {
    const next = [...currentSteps]
    next[index] = { ...next[index], collapsed: !next[index].collapsed }
    setSteps(next)
  }

  function setPrompt(index: number, prompt: string) {
    const next = [...currentSteps]
    next[index] = { ...next[index], prompt }
    setSteps(next)
  }

  function onSave() {
    if (!selectedId) return
    behavior.save({
      assistantId: selectedId,
      steps: currentSteps,
      updatedAt: new Date().toISOString(),
    })
    toast({ type: 'success', title: 'Сценарий сохранён' })
  }

  function onReset() {
    if (!selectedId) return
    if (!window.confirm('Сбросить сценарий к умолчанию?')) return
    const def = behavior.reset(selectedId)
    setSteps(def.steps)
    toast({ type: 'success', title: 'Сценарий сброшен' })
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">Сценарий</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Пошаговые промпты (локально, FSM)</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" onClick={() => setIsJsonOpen(true)} disabled={!selectedId}>
              JSON
            </Button>
            <Button variant="secondary" onClick={onReset} disabled={!selectedId}>
              Сбросить
            </Button>
            <Button variant="primary" onClick={onSave} disabled={!selectedId || currentSteps.length === 0}>
              Сохранить
            </Button>
          </div>
        </div>

        <Card title="Ассистент" description="Выберите ассистента для сценария">
          {assistants.isLoading ? (
            <div className="h-10 animate-pulse rounded-2xl border border-white/10 bg-slate-950/30" />
          ) : assistants.isError ? (
            <div className="text-sm text-slate-300">Не удалось загрузить ассистентов.</div>
          ) : assistantOptions.length === 0 ? (
            <div className="text-sm text-slate-300">Сначала создайте ассистента.</div>
          ) : (
            <label className="block">
              <div className="text-sm text-slate-200">Ассистент</div>
              <select
                value={selectedId}
                onChange={(e) => {
                  const id = e.target.value
                  setAssistantId(id)
                  const def = behavior.get(id)
                  setSteps(def?.steps ?? null)
                }}
                className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/20 focus:ring-2 focus:ring-indigo-500/20"
              >
                {assistantOptions.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>
          )}
        </Card>

        <div className="relative">
          <div className="absolute left-6 top-0 h-full w-px bg-white/10" />

          <div className="space-y-6">
            <AnimatePresence initial={false}>
              {currentSteps.map((step, i) => (
                <motion.div
                  key={`${step.key}_${i}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.18 }}
                  className="relative pl-12"
                >
                  <div className="absolute left-4 top-7 h-4 w-4 rounded-full border border-white/10 bg-slate-950/70 shadow-[0_0_0_6px_rgba(15,23,42,0.55)]" />

                  <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
                      <div>
                        <div className="text-xs font-semibold tracking-[0.18em] text-slate-300">{step.key}</div>
                        <div className="mt-1 text-base font-semibold tracking-tight text-white">{step.title}</div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" onClick={() => move(i, -1)} disabled={i === 0}>
                          Вверх
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => move(i, 1)}
                          disabled={i === currentSteps.length - 1}
                        >
                          Вниз
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => toggleCollapsed(i)}>
                          {step.collapsed ? 'Развернуть' : 'Свернуть'}
                        </Button>
                      </div>
                    </div>

                    {!step.collapsed ? (
                      <div className="p-6">
                        <div className="text-sm text-slate-200">Промпт</div>
                        <textarea
                          className={textareaClassName()}
                          rows={6}
                          placeholder={`Write the ${step.title.toLowerCase()} prompt…`}
                          value={step.prompt}
                          onChange={(e) => setPrompt(i, e.target.value)}
                        />
                        <div className="mt-2 text-xs text-slate-400">
                          Короткие промпты работают лучше. Данные хранятся в браузере.
                        </div>
                      </div>
                    ) : (
                      <div className="p-6">
                        <div className="text-sm text-slate-300">Свёрнуто</div>
                        <div className="mt-2 text-xs text-slate-400">
                          {step.prompt ? `${step.prompt.slice(0, 120)}${step.prompt.length > 120 ? '…' : ''}` : 'Промпт пуст.'}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isJsonOpen ? (
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
              onClick={() => setIsJsonOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, y: 12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 12, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="relative w-full max-w-3xl rounded-2xl border border-white/10 bg-slate-950/60 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-4 border-b border-white/10 p-6">
                <div>
                  <div className="text-sm font-semibold tracking-tight text-white">JSON сценария</div>
                  <div className="mt-1 text-xs text-slate-300">Структура в браузере, отдельно для каждого ассистента.</div>
                </div>
                <Button variant="secondary" onClick={() => setIsJsonOpen(false)}>
                  Закрыть
                </Button>
              </div>

              <div className="p-6">
                <pre className="max-h-[520px] overflow-auto rounded-2xl border border-white/10 bg-slate-950/30 p-4 text-xs text-slate-200">
                  {JSON.stringify(
                    { assistantId: selectedId, steps: currentSteps },
                    null,
                    2,
                  )}
                </pre>
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

