import { useQuery } from '@tanstack/react-query'
import { getAnalytics } from './analytics.api'

export function useAnalytics() {
  return useQuery({
    queryKey: ['analytics'],
    queryFn: getAnalytics,
    staleTime: 30_000,
  })
}

