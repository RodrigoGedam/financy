import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import {
	ChevronRight,
	CircleArrowDown,
	CircleArrowUp,
	Plus,
	Wallet,
} from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { categoryColors, categoryIcons } from '../../config/category-options'
import { formatDateBr, isValidMonth, todayInSaoPaulo } from '../../lib/dates'
import { formatBrl } from '../../lib/money'
import { parseTransactionSearch } from '../transactions/search'
import { useDashboard } from './queries'

export function DashboardPage() {
	const [month, setMonth] = useState(() => todayInSaoPaulo().slice(0, 7))
	const query = useDashboard(month)
	const period = `${month.slice(5)}/${month.slice(0, 4)}`
	const search = parseTransactionSearch({ month })
	return (
		<div className="page-content dashboard-page">
			<header className="categories-header">
				<div>
					<h1>Dashboard</h1>
					<p>Seu resumo financeiro</p>
				</div>
				<div className="field dashboard-month">
					<label htmlFor="dashboard-month">Mês de referência</label>
					<Input
						id="dashboard-month"
						type="month"
						min="0001-01"
						max="9999-12"
						value={month}
						onChange={(e) => {
							if (isValidMonth(e.target.value))
								setMonth(e.target.value)
						}}
						required
					/>
				</div>
			</header>
			{query.isPending ? (
				<div className="categories-state" role="status">
					Carregando dashboard de {period}…
				</div>
			) : query.isError ? (
				<div className="categories-state">
					<p role="alert">
						Não foi possível carregar o dashboard de {period}.
						Verifique a conexão e tente novamente.
					</p>
					<Button
						variant="outline"
						onClick={() => void query.refetch()}
						disabled={query.isFetching}
					>
						Tentar novamente
					</Button>
				</div>
			) : (
				<div className="dashboard-content" aria-busy={query.isFetching}>
					{query.isFetching && (
						<p className="notice" role="status">
							Atualizando dashboard de {period}…
						</p>
					)}
					<div className="dashboard-cards">
						<section
							className="dashboard-card"
							aria-labelledby="balance-title"
						>
							<h2 id="balance-title">
								<Wallet
									className="dashboard-wallet"
									aria-hidden="true"
								/>
								Saldo total
							</h2>
							<strong>{formatBrl(query.data.balance)}</strong>
							<p>Todo o histórico</p>
						</section>
						<section
							className="dashboard-card"
							aria-labelledby="income-title"
						>
							<h2 id="income-title">
								<CircleArrowUp
									className="transaction-income"
									aria-hidden="true"
								/>
								Receitas do mês
							</h2>
							<strong>{formatBrl(query.data.income)}</strong>
							<p>{period}</p>
						</section>
						<section
							className="dashboard-card"
							aria-labelledby="expenses-title"
						>
							<h2 id="expenses-title">
								<CircleArrowDown
									className="transaction-expense"
									aria-hidden="true"
								/>
								Despesas do mês
							</h2>
							<strong>{formatBrl(query.data.expenses)}</strong>
							<p>{period}</p>
						</section>
					</div>
					<div className="dashboard-panels">
						<section
							className="dashboard-panel"
							aria-labelledby="recent-title"
						>
							<header className="dashboard-panel-header">
								<div>
									<h2 id="recent-title">
										Transações recentes
									</h2>
									<p>{period} · até 5 lançamentos</p>
								</div>
								<Link to="/transacoes" search={search}>
									Ver todas
									<ChevronRight aria-hidden="true" />
								</Link>
							</header>
							{query.data.recentTransactions.length ? (
								<ul className="dashboard-recent">
									{query.data.recentTransactions.map((tx) => {
										const color =
											categoryColors[tx.category.color]
										const { Icon } =
											categoryIcons[tx.category.icon]
										const KindIcon =
											tx.kind === 'income'
												? CircleArrowUp
												: CircleArrowDown
										return (
											<li key={tx.id}>
												<span
													className="category-symbol"
													style={{
														backgroundColor:
															color.light,
														color: color.dark,
													}}
												>
													<Icon aria-hidden="true" />
												</span>
												<div className="dashboard-recent-description">
													<h3>{tx.description}</h3>
													<time
														dateTime={
															tx.occurred_on
														}
													>
														{formatDateBr(
															tx.occurred_on,
														)}
													</time>
												</div>
												<span
													className="category-tag"
													style={{
														backgroundColor:
															color.light,
														color: color.dark,
													}}
												>
													{tx.category.name}
												</span>
												<div className="dashboard-recent-amount">
													<strong>
														{tx.kind === 'income'
															? '+ '
															: '− '}
														{formatBrl(tx.amount)}
													</strong>
													<span
														className={
															tx.kind === 'income'
																? 'transaction-income'
																: 'transaction-expense'
														}
													>
														<KindIcon aria-hidden="true" />
														<span className="sr-only">
															{tx.kind ===
															'income'
																? 'Receita'
																: 'Despesa'}
														</span>
													</span>
												</div>
											</li>
										)
									})}
								</ul>
							) : (
								<div className="dashboard-empty">
									<h3>Nenhuma transação neste mês</h3>
									<p>
										Registre uma receita ou despesa
										realizada para acompanhar o período.
									</p>
								</div>
							)}
							<footer className="dashboard-panel-footer">
								<Link to="/transacoes" search={search}>
									<Plus aria-hidden="true" />
									Nova transação
								</Link>
							</footer>
						</section>
						<section
							className="dashboard-panel"
							aria-labelledby="ranking-title"
						>
							<header className="dashboard-panel-header">
								<div>
									<h2 id="ranking-title">Maiores despesas</h2>
									<p>{period} · até 5 categorias</p>
								</div>
								<Link to="/categorias">
									Gerenciar
									<ChevronRight aria-hidden="true" />
								</Link>
							</header>
							{query.data.topCategories.length ? (
								<ol className="dashboard-ranking">
									{query.data.topCategories.map(
										(category) => {
											const color =
												categoryColors[category.color]
											const { Icon } =
												categoryIcons[category.icon]
											return (
												<li key={category.id}>
													<span className="dashboard-ranking-category">
														<Icon
															aria-hidden="true"
															style={{
																color: color.dark,
															}}
														/>
														<span
															className="category-tag"
															style={{
																backgroundColor:
																	color.light,
																color: color.dark,
															}}
														>
															{category.name}
														</span>
													</span>
													<span className="dashboard-count">
														{category.transaction_count.toLocaleString(
															'pt-BR',
														)}{' '}
														{category.transaction_count ===
														1
															? 'despesa'
															: 'despesas'}
													</span>
													<strong>
														{formatBrl(
															category.amount,
														)}
													</strong>
												</li>
											)
										},
									)}
								</ol>
							) : (
								<div className="dashboard-empty">
									<h3>Nenhuma despesa neste mês</h3>
									<p>Receitas não entram neste ranking.</p>
								</div>
							)}
						</section>
					</div>
				</div>
			)}
		</div>
	)
}
