import { AnimatePresence, motion } from 'framer-motion'
import { useMemo, useState } from 'react'
import { useApiKeys, useCreateApiKey, useDeleteApiKey } from '../api/apiKeys.hooks'
import type { ApiKey, CreateApiKeyResult } from '../api/apiKeys.api'
import { Button } from '../shared/ui/Button'
import { Card } from '../shared/ui/Card'
import { Input } from '../shared/ui/Input'
import { useToastStore } from '../store/toast.store'

function maskKey(value: string) {
  if (!value) return ''
  const prefix = value.startsWith('sk_') ? value.slice(0, 10) : value.slice(0, 8)
  const suffix = value.length > 4 ? value.slice(-4) : ''
  return `${prefix}xxxx...${suffix}`
}

function formatDate(value?: string | null) {
  if (!value) return ''
  const t = Date.parse(value)
  if (!Number.isFinite(t)) return value
  return new Date(t).toLocaleString()
}

export function ApiKeysPage() {
  const toast = useToastStore((s) => s.push)
  const keysQuery = useApiKeys()
  const createKey = useCreateApiKey()
  const deleteKey = useDeleteApiKey()

  const [isOpen, setIsOpen] = useState(false)
  const [label, setLabel] = useState('')

  const [created, setCreated] = useState<CreateApiKeyResult | null>(null)

  const keys = useMemo(() => {
    const list = (keysQuery.data ?? []) as ApiKey[]
    return [...list].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }, [keysQuery.data])

  async function onGenerate(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = label.trim()
    if (!trimmed) return
    try {
      const res = await createKey.mutateAsync({ label: trimmed })
      if (!res?.key || typeof res.key !== 'string') throw new Error('Missing key')
      setCreated(res)
      toast({ type: 'success', title: 'API key generated' })
    } catch {
      toast({ type: 'error', title: 'Could not generate API key' })
    }
  }

  async function copyOnce(value: string) {
    try {
      await navigator.clipboard.writeText(value)
      toast({ type: 'success', title: 'Copied!' })
    } catch {
      toast({ type: 'error', title: 'Could not copy to clipboard' })
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.22 }}>
      <div className="space-y-6">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-white">API Keys</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-300">Keys for secure access to the platform API</p>
          </div>
          <Button
            variant="primary"
            onClick={() => {
              setIsOpen(true)
              setCreated(null)
              setLabel('')
            }}
            disabled={keysQuery.isLoading || createKey.isPending || deleteKey.isPending}
          >
            Generate API Key
          </Button>
        </div>

        <Card title="Security" description="Save this key securely">
          <div className="text-sm text-slate-300">
            Full keys are shown <span className="text-white/90">only once</span> at creation time. After reload, keys are
            masked.
          </div>
        </Card>

        {keysQuery.isLoading ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-[132px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              />
            ))}
          </div>
        ) : keysQuery.isError ? (
          <Card title="API Keys" description="Unable to load keys right now">
            <div className="text-sm text-slate-300">Please try again in a moment.</div>
          </Card>
        ) : keys.length === 0 ? (
          <Card title="API Keys" description="Generate your first API key">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-slate-300">Create a key to authenticate requests.</div>
              <Button variant="primary" onClick={() => setIsOpen(true)}>
                Generate API Key
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-3">
            {keys.map((k) => (
              <motion.div
                key={k.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.18 }}
                className="group rounded-2xl border border-white/10 bg-white/[0.04] shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl"
              >
                <div className="p-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold tracking-tight text-white">{k.label}</div>
                      <div className="mt-1 text-xs text-slate-300">Created {formatDate(k.createdAt)}</div>
                      <div className="mt-3 rounded-2xl border border-white/10 bg-slate-950/30 px-3 py-2 font-mono text-xs text-slate-200">
                        {maskKey(k.key ?? '') || 'sk_live_****'}
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={deleteKey.isPending || createKey.isPending}
                      onClick={() => {
                        if (!window.confirm('Are you sure?')) return
                        deleteKey.mutate(k.id, {
                          onSuccess: () => toast({ type: 'success', title: 'API key deleted' }),
                          onError: () => toast({ type: 'error', title: 'Could not delete API key' }),
                        })
                      }}
                    >
                      Delete
                    </Button>
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
              className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950/60 shadow-[0_30px_80px_rgba(0,0,0,0.65)] backdrop-blur-xl"
            >
              <div className="border-b border-white/10 p-6">
                <div className="text-sm font-semibold tracking-tight text-white">Generate API key</div>
                <div className="mt-1 text-xs text-slate-300">Save this key securely. It will be shown only once.</div>
              </div>

              <div className="space-y-4 p-6">
                {created ? (
                  <div className="space-y-3">
                    <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 p-4 text-sm text-amber-100/90">
                      Save this key securely. You won’t be able to see it again after closing this dialog.
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 font-mono text-sm text-white/90">
                      {created.key}
                    </div>
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="secondary" onClick={() => copyOnce(created.key)}>
                        Copy to clipboard
                      </Button>
                      <Button
                        variant="primary"
                        onClick={() => {
                          setIsOpen(false)
                          setCreated(null)
                          setLabel('')
                        }}
                      >
                        Done
                      </Button>
                    </div>
                  </div>
                ) : (
                  <form className="space-y-4" onSubmit={onGenerate}>
                    <Input label="Label" placeholder="Production key" value={label} onChange={(e) => setLabel(e.target.value)} />
                    <div className="flex items-center justify-end gap-2">
                      <Button type="button" variant="secondary" onClick={() => setIsOpen(false)} disabled={createKey.isPending}>
                        Cancel
                      </Button>
                      <Button type="submit" variant="primary" disabled={createKey.isPending || !label.trim()}>
                        {createKey.isPending ? 'Generating…' : 'Generate'}
                      </Button>
                    </div>
                  </form>
                )}
              </div>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.div>
  )
}

