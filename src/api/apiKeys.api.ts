import { api } from '../shared/config/api'

export type ApiKey = {
  id: string
  label: string
  name?: string
  assistantId?: string
  createdAt: string
  key?: string
  allowedDomains?: string[]
}

export type CreateApiKeyInput = {
  label: string
}

export type CreateApiKeyResult = {
  id: string
  label: string
  createdAt: string
  key: string
  allowedDomains?: string[]
}

export async function getApiKeys(): Promise<ApiKey[]> {
  const res = await api.get('/api-keys')
  const rows = res.data as Array<Record<string, unknown>>
  return rows.map((r) => ({
    id: String(r.id ?? ''),
    label: String((r.label ?? r.name) ?? ''),
    name: r.name != null ? String(r.name) : undefined,
    assistantId: r.assistantId != null ? String(r.assistantId) : undefined,
    createdAt: String(r.createdAt ?? ''),
    key: r.key != null ? String(r.key) : undefined,
    allowedDomains: Array.isArray(r.allowedDomains)
      ? (r.allowedDomains as unknown[]).map((d) => String(d))
      : [],
  }))
}

export async function createApiKey(input: CreateApiKeyInput): Promise<CreateApiKeyResult> {
  const res = await api.post('/api-keys', input)
  const data = res.data as Record<string, unknown>
  const key = String(data.key ?? data.apiKey ?? data.token ?? '')
  const id = String(data.id ?? '')
  const createdAt = String(data.createdAt ?? '')
  const label = String(data.label ?? data.name ?? input.label ?? '')
  return {
    id,
    label,
    createdAt,
    key,
    allowedDomains: Array.isArray(data.allowedDomains)
      ? (data.allowedDomains as unknown[]).map((d) => String(d))
      : [],
  }
}

export async function deleteApiKey(id: string): Promise<void> {
  await api.delete(`/api-keys/${encodeURIComponent(id)}`)
}

export type UpdateApiKeyDomainsInput = {
  allowedDomains: string[]
}

export async function setApiKeyDomains(
  id: string,
  input: UpdateApiKeyDomainsInput,
): Promise<ApiKey> {
  const res = await api.patch(`/api-keys/${encodeURIComponent(id)}/domains`, input)
  const data = res.data as Record<string, unknown>
  return {
    id: String(data.id ?? id),
    label: String((data.label ?? data.name) ?? ''),
    name: data.name != null ? String(data.name) : undefined,
    assistantId: data.assistantId != null ? String(data.assistantId) : undefined,
    createdAt: String(data.createdAt ?? ''),
    key: data.key != null ? String(data.key) : undefined,
    allowedDomains: Array.isArray(data.allowedDomains)
      ? (data.allowedDomains as unknown[]).map((d) => String(d))
      : [],
  }
}

