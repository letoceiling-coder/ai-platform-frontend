import { api } from '../shared/config/api'

export type ApiKey = {
  id: string
  label: string
  createdAt: string
  key?: string
}

export type CreateApiKeyInput = {
  label: string
}

export type CreateApiKeyResult = {
  id: string
  label: string
  createdAt: string
  key: string
}

export async function getApiKeys(): Promise<ApiKey[]> {
  const res = await api.get('/api-keys')
  return res.data
}

export async function createApiKey(input: CreateApiKeyInput): Promise<CreateApiKeyResult> {
  const res = await api.post('/api-keys', input)
  const data = res.data ?? {}
  const key = data.key ?? data.apiKey ?? data.token
  return { ...data, key }
}

export async function deleteApiKey(id: string): Promise<void> {
  await api.delete(`/api-keys/${encodeURIComponent(id)}`)
}

