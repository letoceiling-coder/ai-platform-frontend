import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createApiKey, deleteApiKey, getApiKeys, type CreateApiKeyInput } from './apiKeys.api'
import { type UpdateApiKeyDomainsInput, setApiKeyDomains } from './apiKeys.api'

const apiKeysKey = ['api-keys'] as const

export function useApiKeys() {
  return useQuery({
    queryKey: apiKeysKey,
    queryFn: getApiKeys,
  })
}

export function useCreateApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (input: CreateApiKeyInput) => createApiKey(input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: apiKeysKey })
    },
  })
}

export function useDeleteApiKey() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteApiKey(id),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: apiKeysKey })
    },
  })
}

export function useSetApiKeyDomains() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (args: { id: string; input: UpdateApiKeyDomainsInput }) =>
      setApiKeyDomains(args.id, args.input),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: apiKeysKey })
    },
  })
}

