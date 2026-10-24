import { Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { formatBrl } from '../../lib/money'
import { formatDateBr } from '../../lib/dates'
import type { Transaction } from './types'

export function TransactionDetailsDialog({
	transaction,
	onClose,
	restoreFocus,
}: {
	transaction: Transaction
	onClose: () => void
	restoreFocus: () => void
}) {
	return (
		<Dialog.Root
			open
			onOpenChange={(open) => {
				if (!open) onClose()
			}}
		>
			<Dialog.Portal>
				<Dialog.Overlay className="category-overlay" />
				<Dialog.Content
					className="category-dialog transaction-details"
					onCloseAutoFocus={(event) => {
						event.preventDefault()
						restoreFocus()
					}}
				>
					<header className="category-dialog-header">
						<div>
							<Dialog.Title>Detalhes da transação</Dialog.Title>
							<Dialog.Description>
								Informações completas do lançamento
							</Dialog.Description>
						</div>
						<Dialog.Close asChild>
							<Button
								variant="outline"
								className="category-icon-button"
								aria-label="Fechar"
							>
								<X aria-hidden="true" />
							</Button>
						</Dialog.Close>
					</header>
					<dl>
						<div>
							<dt>Descrição</dt>
							<dd>{transaction.description}</dd>
						</div>
						<div>
							<dt>Categoria</dt>
							<dd>{transaction.category.name}</dd>
						</div>
						<div>
							<dt>Data</dt>
							<dd>{formatDateBr(transaction.occurred_on)}</dd>
						</div>
						<div>
							<dt>Tipo</dt>
							<dd>
								{transaction.kind === 'income'
									? 'Receita'
									: 'Despesa'}
							</dd>
						</div>
						<div>
							<dt>Valor</dt>
							<dd>{formatBrl(transaction.amount)}</dd>
						</div>
					</dl>
					<Dialog.Close asChild>
						<Button variant="outline">Fechar detalhes</Button>
					</Dialog.Close>
				</Dialog.Content>
			</Dialog.Portal>
		</Dialog.Root>
	)
}
