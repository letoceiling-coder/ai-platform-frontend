import { api } from '../shared/config/api'

export type Assistant = {
  id: string
  name: string
  createdAt: string
}

export type CreateAssistantInput = {
  name: string
}

export async function getAssistants(): Promise<Assistant[]> {
  const res = await api.get('/assistants')
  return res.data
}

export async function createAssistant(data: CreateAssistantInput): Promise<Assistant> {
  const res = await api.post('/assistants', data)
  return res.data
}

export async function deleteAssistant(id: string): Promise<void> {
  await api.delete(`/assistants/${encodeURIComponent(id)}`)
}

