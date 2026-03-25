import { motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useAssistants } from '../api/assistants.hooks'
import type { Assistant } from '../api/assistants.api'
import { useApiKeys } from '../api/apiKeys.hooks'
import type { ApiKey } from '../api/apiKeys.api'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { Input } from '../shared/ui/Input'
import { useToastStore } from '../store/toast.store'
import { API_URL } from '../shared/config/api'

const WIDGET_SRC = 'https://cdn.siteaacess.ru/widget.v1.js'

function maskKey(value: string) {
  if (!value) return ''
  const prefix = value.startsWith('sk_') ? value.slice(0, 10) : value.slice(0, 8)
  const suffix = value.length > 4 ? value.slice(-4) : ''
  return `${prefix}xxxx...${suffix}`
}

export function WidgetPage() {
  const toast = useToastStore((s) => s.push)
  const assistants = useAssistants()
  const keysQuery = useApiKeys()

  const assistantOptions = useMemo(() => {
    const list = (assistants.data ?? []) as Assistant[]
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [assistants.data])

  const apiKeys = useMemo(() => {
    const list = (keysQuery.data ?? []) as ApiKey[]
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [keysQuery.data])

  const [assistantId, setAssistantId] = useState<string>('')
  const [apiKeyId, setApiKeyId] = useState<string>('')
  const [tokenOverride, setTokenOverride] = useState('')

  const selectedAssistantId = assistantId.trim() || (assistantOptions[0]?.id ?? '')
  const selectedKeyId = apiKeyId.trim() || (apiKeys[0]?.id ?? '')
  const selectedKey = apiKeys.find((k) => k.id === selectedKeyId)

  const resolvedToken = tokenOverride.trim() || selectedKey?.key || ''

  const script = `<script\n  src="${WIDGET_SRC}"\n  data-token="${resolvedToken || 'sk_live_xxxx...1234'}"\n  data-api="${API_URL}"\n></script>`

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(script)
      toast({ type: 'success', title: 'Copied!' })
    } catch {
      toast({ type: 'error', title: 'Could not copy script' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Widget</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Paste this into your website to embed AI</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Settings" description="Connect assistant and API key" className="lg:col-span-1">
            <div className="space-y-4">
              <label className="block">
                <div className="text-sm text-slate-200">Assistant</div>
                <select
                  value={selectedAssistantId}
                  onChange={(e) => setAssistantId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/20 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {assistantOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {assistants.isLoading ? <div className="mt-2 text-xs text-slate-400">Loading assistants…</div> : null}
                {assistants.isError ? <div className="mt-2 text-xs text-rose-300">Could not load assistants.</div> : null}
              </label>

              <label className="block">
                <div className="text-sm text-slate-200">API Key</div>
                <select
                  value={selectedKeyId}
                  onChange={(e) => setApiKeyId(e.target.value)}
                  className="mt-1 w-full rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/20 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {apiKeys.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.label} • {maskKey(k.key ?? 'sk_live_')}
                    </option>
                  ))}
                </select>
                {keysQuery.isLoading ? <div className="mt-2 text-xs text-slate-400">Loading keys…</div> : null}
                {keysQuery.isError ? <div className="mt-2 text-xs text-rose-300">Could not load keys.</div> : null}
              </label>

              {!selectedKey?.key ? (
                <Input
                  label="Token (paste full key)"
                  hint="Full keys are shown only once at creation. Paste it here to generate the script."
                  placeholder="sk_live_..."
                  value={tokenOverride}
                  onChange={(e) => setTokenOverride(e.target.value)}
                />
              ) : null}
            </div>
          </Card>

          <Card title="Embed script" description="Paste this into your website" className="lg:col-span-2">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                <pre className="max-h-[360px] overflow-auto whitespace-pre-wrap font-mono text-xs text-slate-200">
                  {script}
                </pre>
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-slate-300">
                  Source: <span className="font-mono text-slate-200">{WIDGET_SRC}</span>
                </div>
                <Button variant="secondary" onClick={onCopy} disabled={!resolvedToken}>
                  Copy script
                </Button>
              </div>

              {!resolvedToken ? (
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100/90">
                  Select an API key with a full token available, or paste the token manually. We will not re-show full keys
                  after reload.
                </div>
              ) : null}
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}

