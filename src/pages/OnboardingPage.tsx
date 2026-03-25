import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAssistants, useCreateAssistant } from '../api/assistants.hooks'
import { useApiKeys, useCreateApiKey } from '../api/apiKeys.hooks'
import { Button } from '../shared/ui/Button'
import { useToastStore } from '../store/toast.store'

type Step = 1 | 2 | 3

export function OnboardingPage() {
  const navigate = useNavigate()
  const toast = useToastStore((s) => s.push)
  const assistants = useAssistants()
  const keysQuery = useApiKeys()
  const createAssistant = useCreateAssistant()
  const createKey = useCreateApiKey()

  const [step, setStep] = useState<Step>(1)

  const hasAssistant = (assistants.data?.length ?? 0) > 0
  const hasKey = (keysQuery.data?.length ?? 0) > 0

  useEffect(() => {
    if (assistants.isLoading || keysQuery.isLoading) return
    if (!hasAssistant) setStep(1)
    else if (!hasKey) setStep(2)
    else setStep(3)
  }, [assistants.isLoading, keysQuery.isLoading, hasAssistant, hasKey])

  if (assistants.isLoading || keysQuery.isLoading) {
    return (
      <div className="flex min-h-full items-center justify-center text-sm text-slate-300">Загрузка…</div>
    )
  }

  async function onCreateAssistant() {
    try {
      await createAssistant.mutateAsync({ name: 'Мой ассистент' })
      setStep(2)
    } catch {
      toast({ type: 'error', title: 'Не удалось создать ассистента' })
    }
  }

  async function onCreateApiKey() {
    try {
      await createKey.mutateAsync({ label: 'Основной ключ' })
      setStep(3)
    } catch {
      toast({ type: 'error', title: 'Не удалось создать API ключ' })
    }
  }

  return (
    <div className="mx-auto flex min-h-full max-w-5xl items-center justify-center px-6 py-16">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl"
      >
        <h1 className="text-2xl font-semibold tracking-tight text-white">Добро пожаловать в AI Platform</h1>
        <p className="mt-3 text-sm text-slate-300">
          Создайте ассистента и подключите его к вашему сайту за 2 минуты
        </p>

        <div className="mt-8 flex gap-2 text-xs text-slate-400">
          <span className={step >= 1 ? 'text-indigo-300' : ''}>1. Ассистент</span>
          <span>→</span>
          <span className={step >= 2 ? 'text-indigo-300' : ''}>2. Ключ</span>
          <span>→</span>
          <span className={step >= 3 ? 'text-indigo-300' : ''}>3. Готово</span>
        </div>

        <div className="mt-8 space-y-6">
          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">
                Начните с ассистента с именем по умолчанию — его можно изменить позже.
              </p>
              <Button variant="primary" className="w-full" onClick={onCreateAssistant} disabled={createAssistant.isPending}>
                {createAssistant.isPending ? 'Создание…' : 'Создать ассистента'}
              </Button>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <p className="text-sm text-slate-300">Создайте API ключ для виджета и интеграций.</p>
              <Button variant="primary" className="w-full" onClick={onCreateApiKey} disabled={createKey.isPending}>
                {createKey.isPending ? 'Создание…' : 'Создать API ключ'}
              </Button>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4 text-center">
              <p className="text-lg font-medium text-white">Ваш ассистент готов 🚀</p>
              <Button variant="primary" className="w-full" type="button" onClick={() => navigate('/widget')}>
                Перейти к виджету
              </Button>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  )
}
