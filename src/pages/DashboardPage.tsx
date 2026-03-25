import { motion } from 'framer-motion'
import { useAnalytics } from '../api/analytics.hooks'
import { Card } from '../shared/ui/Card'

const nf = new Intl.NumberFormat('ru-RU')

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
      <div className="text-xs text-slate-400">{label}</div>
      <div className="mt-2 text-3xl font-semibold tracking-tight text-white">
        <span className="bg-gradient-to-br from-white via-indigo-200 to-cyan-200 bg-clip-text text-transparent">
          {value}
        </span>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const analytics = useAnalytics()

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Обзор</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Статистика и загрузка системы</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {analytics.isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="h-[120px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              />
            ))
          ) : analytics.isError ? (
            <Card title="Аналитика" description="Не удалось загрузить данные" className="lg:col-span-3">
              <div className="text-sm text-slate-300">Попробуйте обновить страницу чуть позже.</div>
            </Card>
          ) : (
            <>
              <Card title="Чаты" description="Все диалоги">
                <Metric label="Всего" value={nf.format(analytics.data?.totalChats ?? 0)} />
              </Card>
              <Card title="Сообщения" description="Сообщения по всем чатам">
                <Metric label="Всего" value={nf.format(analytics.data?.totalMessages ?? 0)} />
              </Card>
              <Card title="Ассистенты" description="Созданные ассистенты">
                <Metric label="Активных" value={nf.format(analytics.data?.activeAssistants ?? 0)} />
              </Card>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
