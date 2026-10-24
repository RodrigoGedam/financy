import { useRef, useState } from 'react'
import {
	Plus,
	SquarePen,
	Tag,
	Trash2,
	ArrowLeftRight,
	Trophy,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { categoryColors, categoryIcons } from '../../config/category-options'
import { CategoryDialog, DeleteCategoryDialog } from './category-dialog'
import { useCategories } from './queries'
import type { Category } from './types'
import { getCategoryOverview } from './summary'

export function CategoriesPage() {
	const query = useCategories()
	const [dialog, setDialog] = useState<
		| { mode: 'create' }
		| { mode: 'edit' | 'delete'; category: Category }
		| null
	>(null)
	const trigger = useRef<HTMLButtonElement | null>(null)
	const newButton = useRef<HTMLButtonElement>(null)
	let overview = null
	let overviewError = false
	if (query.isSuccess) {
		try {
			overview = getCategoryOverview(query.data)
		} catch {
			overviewError = true
		}
	}
	const restoreFocus = () =>
		(trigger.current?.isConnected && trigger.current.getClientRects().length
			? trigger.current
			: newButton.current
		)?.focus()
	return (
		<div className="page-content categories-page">
			<header className="categories-header">
				<div>
					<h1>Categorias</h1>
					<p>Organize suas transações por categorias</p>
				</div>
				<Button
					ref={newButton}
					className="category-new-button"
					onClick={(event) => {
						trigger.current = event.currentTarget
						setDialog({ mode: 'create' })
					}}
				>
					<Plus aria-hidden="true" />
					Nova categoria
				</Button>
			</header>
			{overview && (
				<section
					className="dashboard-cards category-overview"
					aria-label="Resumo das categorias"
				>
					<div className="dashboard-card">
						<h2>
							<Tag aria-hidden="true" />
							Total de categorias
						</h2>
						<strong>
							{overview.categoryCount.toLocaleString('pt-BR')}
						</strong>
					</div>
					<div className="dashboard-card">
						<h2>
							<ArrowLeftRight aria-hidden="true" />
							Total de transações
						</h2>
						<strong>
							{overview.transactionCount.toLocaleString('pt-BR')}
						</strong>
						<p>Todo o histórico</p>
					</div>
					<div className="dashboard-card">
						<h2>
							<Trophy aria-hidden="true" />
							Categoria mais utilizada
						</h2>
						<strong className="category-overview-name">
							{overview.mostUsed?.name ??
								'Nenhuma categoria utilizada'}
						</strong>
						{overview.mostUsed && (
							<p>
								{overview.mostUsed.transaction_count.toLocaleString(
									'pt-BR',
								)}{' '}
								transações
							</p>
						)}
					</div>
				</section>
			)}
			{overviewError && (
				<p className="error" role="alert">
					Contagem de transações inválida. Tente novamente.
				</p>
			)}
			{query.isPending ? (
				<div className="categories-state" role="status">
					Carregando categorias…
				</div>
			) : query.isError ? (
				<div className="categories-state">
					<p role="alert">
						Não foi possível carregar as categorias. Verifique a
						conexão e tente novamente.
					</p>
					<Button
						variant="outline"
						onClick={() => void query.refetch()}
						disabled={query.isFetching}
					>
						Tentar novamente
					</Button>
				</div>
			) : !query.data.length ? (
				<section className="categories-state">
					<Tag aria-hidden="true" />
					<h2>Você ainda não tem categorias.</h2>
					<p>
						Crie a primeira categoria para organizar suas receitas e
						despesas.
					</p>
					<Button
						onClick={(event) => {
							trigger.current = event.currentTarget
							setDialog({ mode: 'create' })
						}}
					>
						<Plus aria-hidden="true" />
						Criar primeira categoria
					</Button>
				</section>
			) : (
				<div className="categories-grid">
					{query.data.map((category) => {
						const color = categoryColors[category.color]
						const { Icon } = categoryIcons[category.icon]
						return (
							<article
								key={category.id}
								className="category-card"
								aria-labelledby={`category-${category.id}`}
							>
								<div className="category-card-header">
									<span
										className="category-symbol"
										style={{
											backgroundColor: color.light,
											color: color.dark,
										}}
									>
										<Icon aria-hidden="true" />
									</span>
									<div className="category-actions">
										<Button
											className="category-icon-button"
											variant="outline"
											aria-label={`Excluir categoria ${category.name}`}
											onClick={(event) => {
												trigger.current =
													event.currentTarget
												setDialog({
													mode: 'delete',
													category,
												})
											}}
										>
											<Trash2 aria-hidden="true" />
										</Button>
										<Button
											className="category-icon-button"
											variant="outline"
											aria-label={`Editar categoria ${category.name}`}
											onClick={(event) => {
												trigger.current =
													event.currentTarget
												setDialog({
													mode: 'edit',
													category,
												})
											}}
										>
											<SquarePen aria-hidden="true" />
										</Button>
									</div>
								</div>
								<h2 id={`category-${category.id}`}>
									{category.name}
								</h2>
								{category.description && (
									<p className="category-card-description">
										{category.description}
									</p>
								)}
								<div className="category-card-footer">
									<span
										className="category-tag"
										style={{
											backgroundColor: color.light,
											color: color.dark,
										}}
									>
										{category.name}
									</span>
									<span>
										{category.transaction_count.toLocaleString(
											'pt-BR',
										)}{' '}
										{category.transaction_count === 1
											? 'transação'
											: 'transações'}
									</span>
								</div>
							</article>
						)
					})}
				</div>
			)}
			{dialog?.mode === 'create' && (
				<CategoryDialog
					onClose={() => setDialog(null)}
					restoreFocus={restoreFocus}
				/>
			)}
			{dialog?.mode === 'edit' && (
				<CategoryDialog
					category={dialog.category}
					onClose={() => setDialog(null)}
					restoreFocus={restoreFocus}
				/>
			)}
			{dialog?.mode === 'delete' && (
				<DeleteCategoryDialog
					category={dialog.category}
					onClose={() => setDialog(null)}
					restoreFocus={restoreFocus}
				/>
			)}
		</div>
	)
}
