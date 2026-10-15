import { describe, expect, it } from 'vitest'
import { QueryClient } from '@tanstack/react-query'
import { clearAccountCache } from './session-cache'

describe('troca de conta', () => {
  it('remove os dados anteriores e impede que uma resposta tardia repovoe o cache', async () => {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
    client.setQueryData(['finance', 'alice', 'categories'], ['Privado A'])
    let resolve!: (value: string[]) => void
    const pending = client.fetchQuery({ queryKey: ['finance', 'alice', 'late'], queryFn: () => new Promise<string[]>(done => { resolve = done }) }).catch(() => undefined)
    await clearAccountCache(client)
    resolve(['Resposta A'])
    await pending
    expect(client.getQueryData(['finance', 'alice', 'categories'])).toBeUndefined()
    expect(client.getQueryData(['finance', 'alice', 'late'])).toBeUndefined()
    client.setQueryData(['finance', 'bob', 'categories'], ['Privado B'])
    expect(client.getQueryData(['finance', 'bob', 'categories'])).toEqual(['Privado B'])
  })
})
