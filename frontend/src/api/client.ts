import { useQuery, QueryKey } from '@tanstack/react-query'

export interface Module {
  id: string
  title: string
  description: string
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL
const DEV_TOKEN = process.env.NEXT_PUBLIC_DEV_TOKEN

export async function fetchModules(): Promise<Module[]> {
  const res = await fetch(`${API_BASE_URL}/content/modules`, {
    headers: DEV_TOKEN ? { Authorization: `Bearer ${DEV_TOKEN}` } : {},
  })
  if (!res.ok) {
    throw new Error('Failed to fetch modules')
  }
  return res.json()
}

export function useModules(queryKey: QueryKey = ['modules']) {
  return useQuery({ queryKey, queryFn: fetchModules })
}

export async function searchModules(query: string): Promise<Module[]> {
  const res = await fetch(`${API_BASE_URL}/search?q=${encodeURIComponent(query)}`, {
    headers: DEV_TOKEN ? { Authorization: `Bearer ${DEV_TOKEN}` } : {},
  })
  if (!res.ok) {
    throw new Error('Failed to search modules')
  }
  return res.json()
}

export async function fetchSuggestions(query: string): Promise<string[]> {
  const res = await fetch(
    `${API_BASE_URL}/search/suggestions?q=${encodeURIComponent(query)}`,
    { headers: DEV_TOKEN ? { Authorization: `Bearer ${DEV_TOKEN}` } : {} }
  )
  if (!res.ok) {
    throw new Error('Failed to fetch suggestions')
  }
  return res.json()
}
