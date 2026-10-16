import { useEffect, useMemo, useRef, useState } from 'react'
import { getRouteApi, Link } from '@tanstack/react-router'
import {
	flexRender,
	getCoreRowModel,
	useReactTable,
	type ColumnDef,
} from '@tanstack/react-table'
import {
	ChevronLeft,
	ChevronRight,
	Plus,
	SquarePen,
	Trash2,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { categoryColors, categoryIcons } from '../../config/category-options'
import { formatBrl } from '../../lib/money'
import { formatDateBr } from '../../lib/dates'
import { useCategories } from '../categories/queries'
import { useTransactions } from './queries'
import {
	clearTransactionFilters,
	pageIndexToPage,
	pageToPageIndex,
	parseTransactionSearch,
} from './search'
import {
	DeleteTransactionDialog,
	TransactionDialog,
} from './transaction-dialog'
import type { Transaction, TransactionFilters } from './types'

const route = getRouteApi('/app/transacoes')
export function TransactionsPage() {
	'use no memo'
	const filters = route.useSearch()
	const navigate = route.useNavigate()
	const categories = useCategories()
	const query = useTransactions(filters)
	const [dialog, setDialog] = useState<
		| { mode: 'create' }
		| { mode: 'edit' | 'delete'; transaction: Transaction }
		| null
	>(null)
	const trigger = useRef<HTMLButtonElement | null>(null)
	const newButton = useRef<HTMLButtonElement>(null)
	const restoreFocus = () =>
		(trigger.current?.isConnected
			? trigger.current
			: newButton.current
		)?.focus()
	const go = (search: TransactionFilters, replace = false) =>
		void navigate({ search, replace })
	useEffect(() => {
		if (query.data && query.data.page !== filters.page)
			void navigate({
				search: { ...filters, page: query.data.page },
				replace: true,
			})
	}, [query.data, filters, navigate])
	const columns = useMemo<ColumnDef<Transaction>[]>(
		() => [
			{
				accessorKey: 'description',
				header: 'Descrição',
				cell: ({ row }) => {
					const c = row.original.category
					const color = categoryColors[c.color]
					const { Icon } = categoryIcons[c.icon]
					return (
						<div className="transaction-description">
							<span
								className="category-symbol"
								style={{
									backgroundColor: color.light,
									color: color.dark,
								}}
							>
								<Icon aria-hidden="true" />
							</span>
							<span>{row.original.description}</span>
						</div>
					)
				},
			},
			{
				accessorKey: 'occurred_on',
				header: 'Data',
				cell: ({ row }) => formatDateBr(row.original.occurred_on),
			},
			{
				id: 'category',
				header: 'Categoria',
				cell: ({ row }) => {
					const c = row.original.category
					const color = categoryColors[c.color]
					return (
						<span
							className="category-tag"
							style={{
								backgroundColor: color.light,
								color: color.dark,
							}}
						>
							{c.name}
						</span>
					)
				},
			},
			{
				accessorKey: 'kind',
				header: 'Tipo',
				cell: ({ row }) => (
					<span className={`transaction-${row.original.kind}`}>
						{row.original.kind === 'income'
							? '↑ Receita'
							: '↓ Despesa'}
					</span>
				),
			},
			{
				accessorKey: 'amount',
				header: 'Valor',
				cell: ({ row }) => (
					<span className="transaction-amount">
						{row.original.kind === 'expense' ? '− ' : '+ '}
						{formatBrl(row.original.amount)}
					</span>
				),
			},
			{
				id: 'actions',
				header: 'Ações',
				cell: ({ row }) => (
					<div className="category-actions">
						<Button
							variant="outline"
							className="category-icon-button"
							aria-label={`Excluir transação ${row.original.description}`}
							onClick={(e) => {
								trigger.current = e.currentTarget
								setDialog({
									mode: 'delete',
									transaction: row.original,
								})
							}}
						>
							<Trash2 aria-hidden="true" />
						</Button>
						<Button
							variant="outline"
							className="category-icon-button"
							aria-label={`Editar transação ${row.original.description}`}
							onClick={(e) => {
								trigger.current = e.currentTarget
								setDialog({
									mode: 'edit',
									transaction: row.original,
								})
							}}
						>
							<SquarePen aria-hidden="true" />
						</Button>
					</div>
				),
			},
		],
		[],
	)
	// Table v8 permanece neste componente sem memoização; não passamos sua instância a componentes memoizados.
	// eslint-disable-next-line react-hooks/incompatible-library
	const table = useReactTable({
		data: query.data?.rows ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		rowCount: query.data?.count ?? 0,
		state: {
			pagination: {
				pageIndex: pageToPageIndex(filters.page),
				pageSize: 10,
			},
		},
		onPaginationChange: (updater) => {
			const current = {
				pageIndex: pageToPageIndex(filters.page),
				pageSize: 10,
			}
			const next =
				typeof updater === 'function' ? updater(current) : updater
			go({ ...filters, page: pageIndexToPage(next.pageIndex) })
		},
	})
	const count = query.data?.count ?? 0
	const waitingForPage = query.data && query.data.page !== filters.page
	return (
		<div className="page-content transactions-page">
			<header className="categories-header">
				<div>
					<h1>Transações</h1>
					<p>Gerencie todas as suas transações financeiras</p>
				</div>
				<div className="transaction-header-actions">
					<Button
						variant="outline"
						className="category-new-button"
						disabled={query.isFetching || categories.isFetching}
						onClick={() =>
							void Promise.all([
								query.refetch(),
								categories.refetch(),
							])
						}
					>
						Atualizar lista
					</Button>
					<Button
						ref={newButton}
						className="category-new-button"
						disabled={!categories.data?.length}
						onClick={(e) => {
							trigger.current = e.currentTarget
							setDialog({ mode: 'create' })
						}}
					>
						<Plus aria-hidden="true" />
						Nova transação
					</Button>
				</div>
			</header>
			<form
				key={JSON.stringify(filters)}
				className="transaction-filters"
				onSubmit={(e) => {
					e.preventDefault()
					const data = new FormData(e.currentTarget)
					go(
						parseTransactionSearch(
							Object.fromEntries(data.entries()),
						),
					)
				}}
			>
				<div className="field">
					<label htmlFor="filter-q">Buscar</label>
					<Input
						id="filter-q"
						name="q"
						defaultValue={filters.q}
						placeholder="Buscar por descrição"
					/>
				</div>
				<div className="field">
					<label htmlFor="filter-kind">Tipo</label>
					<select
						id="filter-kind"
						name="kind"
						defaultValue={filters.kind}
					>
						<option value="all">Todos</option>
						<option value="income">Receita</option>
						<option value="expense">Despesa</option>
					</select>
				</div>
				<div className="field">
					<label htmlFor="filter-category">Categoria</label>
					<select
						id="filter-category"
						name="categoryId"
						defaultValue={filters.categoryId ?? ''}
					>
						<option value="">Todas</option>
						{filters.categoryId &&
							!categories.data?.some(
								(c) => c.id === filters.categoryId,
							) && (
								<option value={filters.categoryId}>
									Categoria indisponível
								</option>
							)}
						{categories.data?.map((c) => (
							<option key={c.id} value={c.id}>
								{c.name}
							</option>
						))}
					</select>
				</div>
				<div className="field">
					<label htmlFor="filter-month">Período</label>
					<Input
						type="month"
						id="filter-month"
						name="month"
						defaultValue={
							filters.month === 'all' ? '' : filters.month
						}
					/>
					<span className="filter-hint">
						Em branco: todos os meses
					</span>
				</div>
				<div className="transaction-filter-actions">
					<Button type="submit" className="category-new-button">
						Aplicar filtros
					</Button>
					<Button
						variant="ghost"
						type="button"
						className="category-new-button"
						onClick={() => go(clearTransactionFilters())}
					>
						Limpar filtros
					</Button>
				</div>
			</form>
			{categories.isError ? (
				<div className="categories-state">
					<p role="alert">Não foi possível carregar as categorias.</p>
					<Button
						variant="outline"
						onClick={() => void categories.refetch()}
					>
						Tentar novamente
					</Button>
				</div>
			) : categories.isPending ? (
				<p role="status">Carregando categorias…</p>
			) : !categories.data.length ? (
				<section className="categories-state">
					<h2>Crie uma categoria para começar</h2>
					<p>Cada receita ou despesa precisa de uma categoria.</p>
					<Button asChild>
						<Link to="/categorias">Criar categorias</Link>
					</Button>
				</section>
			) : null}
			{query.isPending || waitingForPage ? (
				<div className="categories-state" role="status">
					Carregando transações…
				</div>
			) : query.isError ? (
				<div className="categories-state">
					<p role="alert">
						Não foi possível carregar as transações. Verifique a
						conexão.
					</p>
					<Button
						variant="outline"
						disabled={query.isFetching}
						onClick={() => void query.refetch()}
					>
						Tentar novamente
					</Button>
				</div>
			) : (
				<section
					className="transaction-table-wrap"
					aria-label="Lista de transações"
					aria-busy={query.isFetching}
				>
					{query.isFetching && (
						<p className="notice" role="status">
							Atualizando transações…
						</p>
					)}
					{!count ? (
						<div className="categories-state">
							<h2>Nenhuma transação encontrada</h2>
							<p>
								{filters.q ||
								filters.kind !== 'all' ||
								filters.categoryId ||
								filters.month !== 'all'
									? 'Ajuste ou limpe os filtros para ver outros lançamentos.'
									: 'Registre sua primeira receita ou despesa realizada.'}
							</p>
						</div>
					) : (
						<div className="transaction-table-scroll">
							<table>
								<thead>
									{table.getHeaderGroups().map((group) => (
										<tr key={group.id}>
											{group.headers.map((header) => (
												<th scope="col" key={header.id}>
													{flexRender(
														header.column.columnDef
															.header,
														header.getContext(),
													)}
												</th>
											))}
										</tr>
									))}
								</thead>
								<tbody>
									{table.getRowModel().rows.map((row) => (
										<tr key={row.original.id}>
											{row
												.getVisibleCells()
												.map((cell) => (
													<td key={cell.id}>
														{flexRender(
															cell.column
																.columnDef.cell,
															cell.getContext(),
														)}
													</td>
												))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					)}
					<footer className="transaction-pagination">
						<p role="status">
							{count ? (filters.page - 1) * 10 + 1 : 0} a{' '}
							{Math.min(filters.page * 10, count)} | {count}{' '}
							resultados
						</p>
						<nav aria-label="Paginação">
							<Button
								variant="outline"
								className="category-icon-button"
								aria-label="Primeira página"
								disabled={!table.getCanPreviousPage()}
								onClick={() => table.firstPage()}
							>
								«
							</Button>
							<Button
								variant="outline"
								className="category-icon-button"
								aria-label="Página anterior"
								disabled={!table.getCanPreviousPage()}
								onClick={() => table.previousPage()}
							>
								<ChevronLeft aria-hidden="true" />
							</Button>
							<span aria-current="page">
								{filters.page} /{' '}
								{Math.max(1, table.getPageCount())}
							</span>
							<Button
								variant="outline"
								className="category-icon-button"
								aria-label="Próxima página"
								disabled={!table.getCanNextPage()}
								onClick={() => table.nextPage()}
							>
								<ChevronRight aria-hidden="true" />
							</Button>
							<Button
								variant="outline"
								className="category-icon-button"
								aria-label="Última página"
								disabled={!table.getCanNextPage()}
								onClick={() => table.lastPage()}
							>
								»
							</Button>
						</nav>
					</footer>
				</section>
			)}
			{dialog?.mode === 'create' && (
				<TransactionDialog
					categories={categories.data ?? []}
					onClose={() => setDialog(null)}
					restoreFocus={restoreFocus}
				/>
			)}
			{dialog?.mode === 'edit' && (
				<TransactionDialog
					transaction={dialog.transaction}
					categories={categories.data ?? []}
					onClose={() => setDialog(null)}
					restoreFocus={restoreFocus}
				/>
			)}
			{dialog?.mode === 'delete' && (
				<DeleteTransactionDialog
					transaction={dialog.transaction}
					onClose={() => setDialog(null)}
					restoreFocus={restoreFocus}
				/>
			)}
		</div>
	)
}
