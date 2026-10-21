import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, readFileSync, realpathSync } from 'node:fs'
import { isAbsolute, join, relative, sep } from 'node:path'
import { expect, it } from 'vitest'
import { localIntegrationEnvironment } from '../fixtures/environment'
import { createTestClients, rowId, rows, transactionInput } from '../fixtures/supabase'

// Administração exclusivamente do contêiner descartável; operações de usuário usam JWT público real.
const env = localIntegrationEnvironment(process.env)
const workdir = realpathSync(process.env.FINANCY_LOCAL_WORKDIR ?? '')
const root = realpathSync('test-fixtures/ux-premerge')
const child = relative(root, workdir)
if (!child || child.startsWith(`..${sep}`) || isAbsolute(child)
  || !readFileSync(join(workdir, 'supabase/config.toml'), 'utf8').includes(`project_id = "${env.projectRef}"`)
  || existsSync(join(workdir, 'supabase/.temp/project-ref'))) throw new Error('Runtime local não pertence a este ensaio.')
const container = `supabase_db_${env.projectRef}`
function sql(query: string) {
  const labels = JSON.parse(execFileSync('docker', ['inspect', container, '--format', '{{json .Config.Labels}}'], { encoding: 'utf8' }))
  if (labels['com.supabase.cli.project'] !== env.projectRef) throw new Error('Contêiner local sem identidade esperada.')
  return execFileSync('docker', ['exec', container, 'psql', '-U', 'postgres', '-d', 'postgres', '-At', '-v', 'ON_ERROR_STOP=1', '-c', query], { encoding: 'utf8' }).trim()
}
const lengths = () => JSON.parse(sql(`select coalesce(jsonb_agg(jsonb_build_object('name',conname,'valid',convalidated) order by conname),'[]') from pg_constraint where connamespace='public'::regnamespace and conname in ('categories_name_length_check','transactions_description_length_check')`))
const security = () => JSON.parse(sql(`select jsonb_build_object(
  'acl',(select jsonb_agg(to_jsonb(x) order by x.table_name,x.column_name,x.grantee,x.privilege_type) from (select table_name,column_name,grantee,privilege_type,is_grantable from information_schema.column_privileges where table_schema='public' and table_name in ('categories','transactions') and not (table_name='categories' and column_name='description')) x),
  'policies',(select jsonb_agg(to_jsonb(x) order by x.tablename,x.policyname) from pg_policies x where schemaname='public'),
  'fk',(select jsonb_agg(pg_get_constraintdef(oid) order by conname) from pg_constraint where connamespace='public'::regnamespace and contype='f'),
  'triggers',(select jsonb_agg(pg_get_triggerdef(oid) order by tgname) from pg_trigger where not tgisinternal and tgrelid in ('public.categories'::regclass,'public.transactions'::regclass)),
  'functions',(select jsonb_agg(jsonb_build_object('name',proname,'definer',prosecdef,'acl',proacl) order by proname) from pg_proc where pronamespace in ('public'::regnamespace,'private'::regnamespace) and proname in ('prepare_financial_row','save_transaction','change_transaction','get_dashboard')),
  'rls',(select bool_and(relrowsecurity) from pg_class where oid in ('public.categories'::regclass,'public.transactions'::regclass)))`))
async function migrate(file: string, schemaReady?: () => Promise<boolean>) {
  if (existsSync(join(workdir, 'supabase/migrations', file))) throw new Error('Migration já preparada: use novo runtime para repetir legado.')
  copyFileSync(join('supabase/migrations', file), join(workdir, 'supabase/migrations', file))
  const cli = process.env.FINANCY_LOCAL_CLI
  if (!cli || !isAbsolute(cli)) throw new Error('CLI local explícito obrigatório.')
  execFileSync(cli, ['migration', 'up', '--local', '--workdir', workdir], { stdio: 'pipe', timeout: 120_000 })
  sql(`notify pgrst, 'reload schema'`)
  // A nova coluna precisa estar no cache PostgREST antes da primeira escrita.
  if (schemaReady) {
    for (let attempt = 0; attempt < 40; attempt++) {
      if (await schemaReady()) return
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    throw new Error('Nova coluna não apareceu no cache da API local.')
  }
}

it('ensaia expansão com dados legados, limites Unicode, precisão, concorrência, descrições e segurança', async () => {
  expect(lengths()).toEqual([])
  expect(sql('select count(*) from supabase_migrations.schema_migrations')).toBe('3')
  const baseline = security()
  expect(baseline.rls).toBe(true)
  const f = await createTestClients()
  try {
    const legacyName = 'C'.repeat(80)
    const legacyDescription = 'T'.repeat(80)
    // Não usar categoryInput: a coluna description ainda não existe nesta fase.
    const category = rows(await f.request(f.alice, 'categories', 'POST', { name: legacyName, color: 'green', icon: 'utensils' }))[0]
    const id = rowId(category)
    const original = rows(await f.request(f.alice, 'transactions', 'POST', { ...transactionInput(id), description: legacyDescription, amount: '9007199254740993.01' }))[0]
    const tid = rowId(original)
    await migrate('20261020165607_financial_titles.sql')
    expect(lengths()).toEqual([{ name: 'categories_name_length_check', valid: false }, { name: 'transactions_description_length_check', valid: false }])
    expect(rows(await f.request(f.alice, 'categories', 'GET', undefined, id))[0]).toEqual(category)
    expect(rows(await f.request(f.alice, 'transactions', 'GET', undefined, tid))[0]).toEqual(original)
    expect((await f.request(f.alice, 'categories', 'PATCH', { color: 'blue' }, id)).code).toBe('23514')
    expect((await f.request(f.alice, 'transactions', 'PATCH', { amount: '2.00' }, tid)).code).toBe('23514')
    expect(rows(await f.request(f.alice, 'transactions', 'GET', undefined, tid))[0]).toEqual(original)
    expect((await f.request(f.alice, 'transactions', 'POST', transactionInput(id))).status).toBe(201)

    for (const count of [19, 20, 21]) {
      for (const char of ['x', '😀']) {
        const title = char.repeat(count)
        const result = await f.request(f.alice, 'categories', 'POST', { name: `\u00a0\ufeff${title}\t`, color: 'green', icon: 'utensils' })
        if (count === 21) expect(result.code).toBe('23514')
        else expect(rows(result)[0].name).toBe(title)
        const direct = await f.request(f.alice, 'transactions', 'POST', { ...transactionInput(id), description: `\u00a0\ufeff${title}\t` })
        if (count === 21) expect(direct.code).toBe('23514')
        else expect(rows(direct)[0].description).toBe(title)
        const rpc = await f.alice.rpc('save_transaction', { p_description: title, p_kind: 'expense', p_amount: '0.01', p_occurred_on: '2026-01-01', p_category_id: id })
        if (count === 21) expect(rpc.error?.code).toBe('23514')
        else {
          expect(rpc.error).toBeNull()
          f.track(f.alice, 'transactions', rpc.data!)
          const snapshot = { description: title, kind: 'expense', amount: '0.01', occurred_on: '2026-01-01', category_id: id }
          const args = { p_id: rpc.data!, p_expected: snapshot, p_description: 'y'.repeat(21), p_kind: 'expense', p_amount: '0.01', p_occurred_on: '2026-01-01', p_category_id: id }
          expect((await f.alice.rpc('change_transaction', args)).error?.code).toBe('23514')
          expect((await f.alice.rpc('change_transaction', { ...args, p_description: 'Alterado' })).error).toBeNull()
          expect((await f.alice.rpc('change_transaction', { ...args, p_description: 'Concorrente' })).error?.code).toBe('P0001')
        }
      }
    }
    for (const title of ['e\u0301'.repeat(10), 'Com  espaço interno']) {
      expect(rows(await f.request(f.alice, 'categories', 'POST', { name: title, color: 'green', icon: 'utensils' }))[0].name).toBe(title)
    }
    expect((await f.request(f.alice, 'categories', 'PATCH', { name: 'Corrigida' }, id)).status).toBe(200)
    const snapshot = { description: legacyDescription, kind: 'expense', amount: '9007199254740993.01', occurred_on: '2026-01-01', category_id: id }
    const args = { p_id: tid, p_expected: snapshot, p_description: 'Corrigido', p_kind: 'expense', p_amount: '9007199254740993.01', p_occurred_on: '2026-01-01', p_category_id: id }
    expect((await f.alice.rpc('change_transaction', args)).error).toBeNull()
    expect((await f.alice.rpc('change_transaction', args)).error?.code).toBe('P0001')
    await migrate('20261020165709_category_description.sql', async () => !(await f.alice.from('categories').select('description').limit(0)).error)
    expect(security()).toEqual(baseline)
    expect(rows(await f.request(f.alice, 'categories', 'GET', undefined, id))[0].description).toBeNull()
    const description = 'Uma descrição opcional com mais de vinte caracteres.'
    const detailed = rows(await f.request(f.alice, 'categories', 'POST', { name: 'Detalhada', description: `\t${description}\u00a0`, color: 'blue', icon: 'utensils' }))[0]
    expect(detailed.description).toBe(description)
    expect((await f.request(f.alice, 'categories', 'PATCH', { description: `\ufeff${description}\t` }, id)).status).toBe(200)
    expect(rows(await f.request(f.alice, 'categories', 'GET', undefined, id))[0].description).toBe(description)
    const embedded = await f.alice.from('transactions').select('amount::text,categories(description)').eq('id', tid).single()
    expect(embedded.error).toBeNull()
    expect(embedded.data?.amount).toBe('9007199254740993.01')
    expect(embedded.data?.categories?.description).toBe(description)
    // Isolar um registro recente para provar ambos os caminhos JSON sem depender da ordem de UUIDs.
    const dashboard = await f.alice.rpc('get_dashboard', { p_month: '2026-01-01' })
    expect(dashboard.error).toBeNull()
    const value = dashboard.data as { topCategories: {id:string;description:string}[]; recentTransactions: {category:{id:string;description:string}}[] }
    expect(value.topCategories.find(c => c.id === id)?.description).toBe(description)
    expect(value.recentTransactions.find(t => t.category.id === id)?.category.description).toBe(description)
    expect((await f.request(f.alice, 'categories', 'PATCH', { description: '\u00a0\ufeff\t' }, id)).status).toBe(200)
    expect(rows(await f.request(f.alice, 'categories', 'GET', undefined, id))[0].description).toBeNull()
    expect(rows(await f.request(f.bob, 'categories', 'GET', undefined, id))).toEqual([])
    expect(rows(await f.request(f.bob, 'categories', 'PATCH', { description: 'Intruso' }, id))).toEqual([])
    expect((await f.request(f.anon, 'categories')).status).toBeGreaterThanOrEqual(400)
    expect(sql(`select has_column_privilege('authenticated','public.categories','description','INSERT') and has_column_privilege('authenticated','public.categories','description','UPDATE') and not has_column_privilege('anon','public.categories','description','INSERT')`)).toBe('t')
    expect(sql('select count(*) from supabase_migrations.schema_migrations')).toBe('5')
    console.log('Ensaio legado: M1/M2, Unicode, NOT VALID, snapshots, decimal, descrição, RLS e ACL confirmados.')
  } finally { await f.cleanup() }
})
