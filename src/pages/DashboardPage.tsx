import { motion } from 'framer-motion'
import { useAnalytics } from '../api/analytics.hooks'
import { Card } from '../shared/ui/Card'

const nf = new Intl.NumberFormat()

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
          <h1 className="text-3xl font-semibold tracking-tight text-white">Overview</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">System status and usage</p>
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
            <Card title="Analytics" description="Unable to load analytics right now" className="lg:col-span-3">
              <div className="text-sm text-slate-300">Please try again in a moment.</div>
            </Card>
          ) : (
            <>
              <Card title="Total Chats" description="All conversations">
                <Metric label="Total" value={nf.format(analytics.data?.totalChats ?? 0)} />
              </Card>
              <Card title="Total Messages" description="All messages across chats">
                <Metric label="Total" value={nf.format(analytics.data?.totalMessages ?? 0)} />
              </Card>
              <Card title="Active Assistants" description="Assistants created">
                <Metric label="Active" value={nf.format(analytics.data?.activeAssistants ?? 0)} />
              </Card>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}
