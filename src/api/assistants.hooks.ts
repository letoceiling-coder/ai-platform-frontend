import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createAssistant, deleteAssistant, getAssistants, type Assistant, type CreateAssistantInput } from './assistants.api'

const assistantsKey = ['assistants'] as const

export function useAssistants() {
  return useQuery({
    queryKey: assistantsKey,
    queryFn: getAssistants,
  })
}

export function useCreateAssistant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateAssistantInput) => createAssistant(data),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: assistantsKey })
    },
  })
}

export function useDeleteAssistant() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteAssistant(id),
    onMutate: async (id) => {
      await qc.cancelQueries({ queryKey: assistantsKey })
      const previous = qc.getQueryData<Assistant[]>(assistantsKey)
      qc.setQueryData<Assistant[]>(assistantsKey, (old) => (old ? old.filter((a) => a.id !== id) : old))
      return { previous }
    },
    onError: (_err, _id, ctx) => {
      if (ctx?.previous) qc.setQueryData(assistantsKey, ctx.previous)
    },
    onSettled: async () => {
      await qc.invalidateQueries({ queryKey: assistantsKey })
    },
  })
}

