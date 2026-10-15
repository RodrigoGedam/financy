import type { QueryClient } from '@tanstack/react-query'

export async function clearAccountCache(client: QueryClient) {
  await client.cancelQueries()
  client.clear()
}
