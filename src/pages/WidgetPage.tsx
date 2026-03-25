import { motion } from 'framer-motion'
import { useEffect, useMemo, useState } from 'react'
import { useAssistants } from '../api/assistants.hooks'
import type { Assistant } from '../api/assistants.api'
import { useApiKeys, useSetApiKeyDomains } from '../api/apiKeys.hooks'
import type { ApiKey } from '../api/apiKeys.api'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { useToastStore } from '../store/toast.store'

const WIDGET_SRC = 'https://cdn.siteaacess.ru/widget.v1.js'
const WIDGET_API_ORIGIN = 'https://api.siteaacess.ru'

function maskKeyForDropdown(value: string) {
  const v = value?.trim()
  if (!v) return 'sk_live_xxxx...abcd'
  const prefix = v.startsWith('sk_live_') ? 'sk_live_' : v.startsWith('sk_') ? v.slice(0, 8) : 'sk_live_'
  const suffix = v.length >= 4 ? v.slice(-4) : 'abcd'
  return `${prefix}xxxx...${suffix}`
}

function keyDisplayName(k: ApiKey) {
  return k.label?.trim() || 'API key'
}

export function WidgetPage() {
  const toast = useToastStore((s) => s.push)
  const assistants = useAssistants()
  const keysQuery = useApiKeys()
  const setDomains = useSetApiKeyDomains()

  const assistantOptions = useMemo(() => {
    const list = (assistants.data ?? []) as Assistant[]
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [assistants.data])

  const apiKeys = useMemo(() => {
    const list = (keysQuery.data ?? []) as ApiKey[]
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [keysQuery.data])

  const [assistantId, setAssistantId] = useState('')
  const [apiKeyId, setApiKeyId] = useState('')

  const selectedAssistantId = assistantId.trim() || assistantOptions[0]?.id || ''

  const keysForAssistant = useMemo(() => apiKeys, [apiKeys])

  const selectedKeyId = useMemo(() => {
    if (apiKeyId && keysForAssistant.some((k) => k.id === apiKeyId)) return apiKeyId
    return keysForAssistant[0]?.id ?? ''
  }, [apiKeyId, keysForAssistant])

  useEffect(() => {
    if (apiKeyId && !keysForAssistant.some((k) => k.id === apiKeyId)) {
      setApiKeyId('')
    }
  }, [keysForAssistant, apiKeyId])

  const selectedKey = keysForAssistant.find((k) => k.id === selectedKeyId)
  const key = selectedKey?.key
  const allowedDomainsFromKey = selectedKey?.allowedDomains ?? []

  const script = key
    ? `<script
  src="${WIDGET_SRC}"
  data-token="${key}"
  data-api="${WIDGET_API_ORIGIN}"
></script>`
    : ''

  const [allowedDomainsText, setAllowedDomainsText] = useState('')
  useEffect(() => {
    const list = allowedDomainsFromKey ?? []
    setAllowedDomainsText(list.join('\n'))
  }, [selectedKeyId])

  async function onCopy() {
    if (!key || !script) return
    try {
      await navigator.clipboard.writeText(script)
      toast({ type: 'success', title: 'Copied!' })
    } catch {
      toast({ type: 'error', title: 'Could not copy script' })
    }
  }

  const noKeysForAssistant = keysForAssistant.length === 0

  function parseDomains(text: string) {
    return text
      .split(/[\n,]+/g)
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 50)
  }

  async function onSaveDomains() {
    if (!selectedKeyId) return
    const allowedDomains = parseDomains(allowedDomainsText)
    try {
      await setDomains.mutateAsync({ id: selectedKeyId, input: { allowedDomains } })
      toast({ type: 'success', title: 'Allowed domains updated' })
    } catch {
      toast({ type: 'error', title: 'Could not save domains' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white">Widget</h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-300">Embed the assistant on your site — pick a key, copy the snippet</p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card title="Settings" description="Assistant and API key" className="lg:col-span-1">
            <div className="space-y-4">
              <label className="block">
                <div className="text-sm text-slate-200">Assistant</div>
                <select
                  value={selectedAssistantId}
                  onChange={(e) => {
                    setAssistantId(e.target.value)
                    setApiKeyId('')
                  }}
                  className="mt-1 w-full max-w-full truncate rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/20 focus:ring-2 focus:ring-indigo-500/20"
                >
                  {assistantOptions.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
                {assistants.isLoading ? <div className="mt-2 text-xs text-slate-400">Loading assistants…</div> : null}
                {assistants.isError ? <div className="mt-2 text-xs text-rose-300">Could not load assistants.</div> : null}
                {!assistants.isLoading && assistantOptions.length === 0 ? (
                  <div className="mt-2 text-xs text-amber-200/90">Create an assistant first.</div>
                ) : null}
              </label>

              <label className="block">
                <div className="text-sm text-slate-200">API key</div>
                <select
                  value={selectedKeyId}
                  onChange={(e) => setApiKeyId(e.target.value)}
                  disabled={noKeysForAssistant || keysQuery.isLoading}
                  className="mt-1 w-full max-w-full truncate overflow-hidden whitespace-nowrap rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/20 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50"
                >
                  {keysForAssistant.map((k) => {
                    const maskSource = k.key || ''
                    const masked = maskKeyForDropdown(maskSource)
                    return (
                      <option key={k.id} value={k.id} title={k.key || masked}>
                        {keyDisplayName(k)} — {masked}
                      </option>
                    )
                  })}
                </select>
                {keysQuery.isLoading ? <div className="mt-2 text-xs text-slate-400">Loading keys…</div> : null}
                {keysQuery.isError ? <div className="mt-2 text-xs text-rose-300">Could not load keys.</div> : null}
                {!keysQuery.isLoading && noKeysForAssistant ? (
                  <div className="mt-2 text-xs text-amber-200/90">No API keys for this assistant. Generate one on the API Keys page.</div>
                ) : null}
              </label>

              <label className="block">
                <div className="text-sm text-slate-200">Allowed domains</div>
                <textarea
                  value={allowedDomainsText}
                  onChange={(e) => setAllowedDomainsText(e.target.value)}
                  disabled={!selectedKey?.key || setDomains.isPending}
                  placeholder={'example.com\\nlocalhost\\n*.mysite.com'}
                  className="mt-1 h-28 w-full resize-none rounded-2xl border border-white/10 bg-slate-950/40 px-4 py-2.5 text-sm text-white/90 outline-none focus:border-white/20 focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <div className="mt-2 text-xs text-slate-400">
                  Comma/newline separated. Domain check uses <span className="text-slate-200">origin.includes(domain)</span>.
                </div>
                <div className="mt-3">
                  <Button
                    variant="secondary"
                    type="button"
                    onClick={onSaveDomains}
                    disabled={!selectedKey?.key || setDomains.isPending}
                  >
                    Save domains
                  </Button>
                </div>
              </label>
            </div>
          </Card>

          <Card title="Embed script" description="Paste into your site HTML" className="lg:col-span-2">
            <div className="space-y-4">
              <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4">
                {script ? (
                  <pre className="max-h-[360px] overflow-auto break-all whitespace-pre-wrap font-mono text-xs leading-relaxed text-slate-200">
                    {script}
                  </pre>
                ) : (
                  <p className="text-sm text-slate-400">
                    Select an API key to get your embed script.
                  </p>
                )}
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0 text-xs text-slate-400">
                  <span className="text-slate-500">CDN:</span>{' '}
                  <span className="break-all font-mono text-slate-300">{WIDGET_SRC}</span>
                </div>
                <Button
                  variant="primary"
                  type="button"
                  onClick={onCopy}
                    disabled={!key}
                    className="disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Copy script
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </motion.div>
  )
}
