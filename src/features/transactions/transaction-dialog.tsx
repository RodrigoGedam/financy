import { useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertDialog, Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { formatBrl, parseAmountPtBr } from '../../lib/money'
import { formatDateBr, todayInSaoPaulo } from '../../lib/dates'
import type { Category } from '../categories/types'
import { useTransactionMutations } from './queries'
import type { Transaction, TransactionKind } from './types'

type Props = {
	transaction?: Transaction
	categories: Category[]
	onClose: () => void
	restoreFocus: () => void
}
function dateError(value: string) {
	try {
		formatDateBr(value)
	} catch {
		return 'Informe uma data válida.'
	}
	return value > todayInSaoPaulo() ? 'A data não pode ser futura.' : undefined
}
export function TransactionDialog({
	transaction,
	categories,
	onClose,
	restoreFocus,
}: Props) {
	const nameRef = useRef<HTMLInputElement>(null)
	const [error, setError] = useState('')
	const mutations = useTransactionMutations()
	const busy = mutations.create.isPending || mutations.update.isPending
	const form = useForm({
		defaultValues: {
			description: transaction?.description ?? '',
			kind: transaction?.kind ?? ('expense' as TransactionKind),
			amount: transaction?.amount.replace('.', ',') ?? '',
			occurred_on: transaction?.occurred_on ?? todayInSaoPaulo(),
			category_id: transaction?.category_id ?? '',
		},
		onSubmit: async ({ value }) => {
			setError('')
			const amount = parseAmountPtBr(value.amount)
			if (!amount) {
				setError(
					'Informe um valor positivo, com até duas casas decimais e agrupamento válido.',
				)
				return
			}
			if (!categories.some((c) => c.id === value.category_id)) {
				setError('Selecione uma categoria disponível.')
				return
			}
			try {
				const input = { ...value, amount }
				if (transaction)
					await mutations.update.mutateAsync({
						original: transaction,
						value: input,
					})
				else await mutations.create.mutateAsync(input)
				onClose()
			} catch (cause) {
				setError(
					cause instanceof Error
						? cause.message
						: 'Não foi possível salvar. Tente novamente.',
				)
			}
		},
	})
	return (
		<Dialog.Root
			open
			onOpenChange={(open) => {
				if (!open && !busy) onClose()
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="category-overlay" />
				<Dialog.Content
					className="category-dialog transaction-dialog"
					onOpenAutoFocus={(e) => {
						e.preventDefault()
						nameRef.current?.focus()
					}}
					onCloseAutoFocus={(e) => {
						e.preventDefault()
						restoreFocus()
					}}
					onInteractOutside={(e) => e.preventDefault()}
				>
					<header className="category-dialog-header">
						<div>
							<Dialog.Title>
								{transaction
									? 'Editar transação'
									: 'Nova transação'}
							</Dialog.Title>
							<Dialog.Description>
								Registre sua despesa ou receita realizada
							</Dialog.Description>
						</div>
						<Dialog.Close asChild>
							<Button
								variant="outline"
								className="category-icon-button"
								aria-label="Fechar"
								disabled={busy}
							>
								<X aria-hidden="true" />
							</Button>
						</Dialog.Close>
					</header>
					<form
						className="transaction-form"
						noValidate
						aria-busy={busy}
						onSubmit={(e) => {
							e.preventDefault()
							if (!busy) void form.handleSubmit()
						}}
					>
						<form.Field name="kind">
							{(field) => (
								<fieldset
									className="transaction-kind"
									disabled={busy}
								>
									<legend className="sr-only">Tipo</legend>
									{(['expense', 'income'] as const).map(
										(kind) => (
											<label key={kind}>
												<input
													type="radio"
													name="kind"
													checked={
														field.state.value ===
														kind
													}
													onChange={() =>
														field.handleChange(kind)
													}
												/>
												<span>
													{kind === 'expense'
														? '↓ Despesa'
														: '↑ Receita'}
												</span>
											</label>
										),
									)}
								</fieldset>
							)}
						</form.Field>
						<form.Field
							name="description"
							validators={{
								onSubmit: ({ value }) =>
									!value.trim()
										? 'Informe a descrição.'
										: undefined,
							}}
						>
							{(field) => (
								<div className="field">
									<label htmlFor="tx-description">
										Descrição
									</label>
									<Input
										ref={nameRef}
										id="tx-description"
										value={field.state.value}
										onChange={(e) =>
											field.handleChange(e.target.value)
										}
										disabled={busy}
										autoComplete="off"
										placeholder="Ex. Almoço no restaurante"
										required
										aria-invalid={!field.state.meta.isValid}
										aria-describedby={
											field.state.meta.errors.length
												? 'tx-description-error'
												: undefined
										}
									/>
									{field.state.meta.errors.length > 0 && (
										<p
											id="tx-description-error"
											className="error"
											role="alert"
										>
											{field.state.meta.errors.join(' ')}
										</p>
									)}
								</div>
							)}
						</form.Field>
						<div className="transaction-form-pair">
							<form.Field
								name="occurred_on"
								validators={{
									onSubmit: ({ value }) => dateError(value),
								}}
							>
								{(field) => (
									<div className="field">
										<label htmlFor="tx-date">Data</label>
										<Input
											id="tx-date"
											type="date"
											max={todayInSaoPaulo()}
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value,
												)
											}
											disabled={busy}
											required
											aria-invalid={
												!field.state.meta.isValid
											}
											aria-describedby={
												field.state.meta.errors.length
													? 'tx-date-error'
													: undefined
											}
										/>
										{field.state.meta.errors.length > 0 && (
											<p
												id="tx-date-error"
												className="error"
												role="alert"
											>
												{field.state.meta.errors.join(
													' ',
												)}
											</p>
										)}
									</div>
								)}
							</form.Field>
							<form.Field
								name="amount"
								validators={{
									onSubmit: ({ value }) =>
										!parseAmountPtBr(value)
											? 'Informe um valor positivo com até duas casas decimais.'
											: undefined,
								}}
							>
								{(field) => (
									<div className="field">
										<label htmlFor="tx-amount">
											Valor (R$)
										</label>
										<Input
											id="tx-amount"
											inputMode="decimal"
											value={field.state.value}
											onChange={(e) =>
												field.handleChange(
													e.target.value,
												)
											}
											disabled={busy}
											placeholder="0,00"
											required
											aria-invalid={
												!field.state.meta.isValid
											}
											aria-describedby={
												field.state.meta.errors.length
													? 'tx-amount-error'
													: undefined
											}
										/>
										{field.state.meta.errors.length > 0 && (
											<p
												id="tx-amount-error"
												className="error"
												role="alert"
											>
												{field.state.meta.errors.join(
													' ',
												)}
											</p>
										)}
									</div>
								)}
							</form.Field>
						</div>
						<form.Field
							name="category_id"
							validators={{
								onSubmit: ({ value }) =>
									!categories.some((c) => c.id === value)
										? 'Selecione uma categoria disponível.'
										: undefined,
							}}
						>
							{(field) => (
								<div className="field">
									<label htmlFor="tx-category">
										Categoria
									</label>
									<select
										id="tx-category"
										value={field.state.value}
										onChange={(e) =>
											field.handleChange(e.target.value)
										}
										disabled={busy}
										required
										aria-invalid={!field.state.meta.isValid}
										aria-describedby={
											field.state.meta.errors.length
												? 'tx-category-error'
												: undefined
										}
									>
										<option value="">Selecione</option>
										{categories.map((c) => (
											<option key={c.id} value={c.id}>
												{c.name}
											</option>
										))}
									</select>
									{field.state.meta.errors.length > 0 && (
										<p
											id="tx-category-error"
											className="error"
											role="alert"
										>
											{field.state.meta.errors.join(' ')}
										</p>
									)}
								</div>
							)}
						</form.Field>
						{error && (
							<p className="error" role="alert">
								{error}
							</p>
						)}
						<form.Subscribe selector={(s) => s.isSubmitting}>
							{(submitting) => (
								<Button
									type="submit"
									disabled={busy || submitting}
								>
									{busy
										? 'Salvando…'
										: error
											? 'Tentar novamente'
											: 'Salvar'}
								</Button>
							)}
						</form.Subscribe>
					</form>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
export function DeleteTransactionDialog({
	transaction,
	onClose,
	restoreFocus,
}: Omit<Props, 'categories'> & { transaction: Transaction }) {
	const { remove } = useTransactionMutations()
	const [error, setError] = useState('')
	const confirm = async () => {
		if (remove.isPending) return
		setError('')
		try {
			await remove.mutateAsync(transaction)
			onClose()
		} catch (cause) {
			setError(
				cause instanceof Error
					? cause.message
					: 'Não foi possível excluir.',
			)
		}
	}
	return (
		<AlertDialog.Root
			open
			onOpenChange={(open) => {
				if (!open && !remove.isPending) onClose()
			}}
		>
			<AlertDialog.Portal>
				<AlertDialog.Overlay className="category-overlay" />
				<AlertDialog.Content
					className="category-dialog"
					onCloseAutoFocus={(e) => {
						e.preventDefault()
						restoreFocus()
					}}
				>
					<div className="category-dialog-header">
						<div>
							<AlertDialog.Title>
								Excluir transação?
							</AlertDialog.Title>
							<AlertDialog.Description>
								“{transaction.description}” —{' '}
								{formatBrl(transaction.amount)}. Esta exclusão é
								definitiva.
							</AlertDialog.Description>
						</div>
					</div>
					{error && (
						<p className="error" role="alert">
							{error}
						</p>
					)}
					<div className="category-confirm-actions">
						<AlertDialog.Cancel asChild>
							<Button
								variant="outline"
								disabled={remove.isPending}
							>
								Cancelar
							</Button>
						</AlertDialog.Cancel>
						<Button
							variant="destructive"
							disabled={remove.isPending}
							onClick={() => void confirm()}
						>
							{remove.isPending
								? 'Excluindo…'
								: error
									? 'Tentar novamente'
									: 'Excluir'}
						</Button>
					</div>
				</AlertDialog.Content>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	)
}
