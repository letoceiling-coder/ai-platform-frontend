import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createDocument, deleteDocument, getDocuments, type CreateDocumentInput } from './documents.api'

export function useDocuments(assistantId?: string | null) {
  return useQuery({
    queryKey: ['documents', { assistantId: assistantId ?? null }],
    queryFn: () => getDocuments(assistantId as string),
    enabled: Boolean(assistantId),
  })
}

export function useCreateDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateDocumentInput) => createDocument(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

export function useDeleteDocument() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteDocument(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['documents'] })
    },
  })
}

