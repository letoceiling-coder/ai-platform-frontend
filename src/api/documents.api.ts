import { api } from '../shared/config/api'

export type DocumentType = 'manual' | 'file' | 'url'

export type Document = {
  id: string
  assistantId?: string | null
  title: string
  type: DocumentType
  createdAt: string
  chunksCount?: number | null
  chunks?: unknown[] | null
}

export type CreateDocumentInput = {
  assistantId: string
  title: string
  type: DocumentType
  content: string
}

export async function getDocuments(assistantId: string): Promise<Document[]> {
  const res = await api.get('/documents', { params: { assistantId } })
  return res.data
}

export async function createDocument(data: CreateDocumentInput): Promise<Document> {
  const res = await api.post('/documents', data)
  return res.data
}

export async function deleteDocument(id: string): Promise<void> {
  await api.delete(`/documents/${encodeURIComponent(id)}`)
}

