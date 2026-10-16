import { useRef, useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { AlertDialog, Dialog } from 'radix-ui'
import { X } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { categoryColors, categoryIcons, isCategoryColor, isCategoryIcon } from '../../config/category-options'
import { useCategoryMutations } from './queries'
import type { Category, CategoryInput } from './types'

type Props = { category?: Category; onClose: () => void; restoreFocus: () => void }

export function CategoryDialog({ category, onClose, restoreFocus }: Props) {
  const nameRef = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const mutations = useCategoryMutations()
  const initial: CategoryInput = { name: category?.name ?? '', color: category?.color ?? 'green', icon: category?.icon ?? 'briefcase-business' }
  const form = useForm({
    defaultValues: initial,
    onSubmit: async ({ value }) => {
      setError('')
      try {
        if (category) await mutations.update.mutateAsync({ id: category.id, value })
        else await mutations.create.mutateAsync(value)
        onClose()
      } catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível salvar. Tente novamente.') }
    },
  })
  const busy = mutations.create.isPending || mutations.update.isPending
  return <Dialog.Root open onOpenChange={open => { if (!open && !busy) onClose() }}>
    <Dialog.Portal>
      <Dialog.Overlay className="category-overlay" />
      <Dialog.Content className="category-dialog" onOpenAutoFocus={event => { event.preventDefault(); nameRef.current?.focus() }} onCloseAutoFocus={event => { event.preventDefault(); restoreFocus() }} onInteractOutside={event => event.preventDefault()}>
        <header className="category-dialog-header">
          <div><Dialog.Title>{category ? 'Editar categoria' : 'Nova categoria'}</Dialog.Title><Dialog.Description>Organize suas transações com categorias</Dialog.Description></div>
          <Dialog.Close asChild><Button className="category-icon-button" variant="outline" aria-label="Fechar" disabled={busy}><X aria-hidden="true" /></Button></Dialog.Close>
        </header>
        <form className="category-form" noValidate aria-busy={busy} onSubmit={event => { event.preventDefault(); void form.handleSubmit() }}>
          <form.Field name="name" validators={{ onSubmit: ({ value }) => !value.trim() ? 'Informe o nome da categoria.' : undefined }}>{field => <div className="field">
            <label htmlFor="category-name">Nome</label>
            <Input ref={nameRef} id="category-name" autoComplete="off" placeholder="Ex. Alimentação" value={field.state.value} onChange={event => field.handleChange(event.target.value)} onBlur={field.handleBlur} aria-invalid={!field.state.meta.isValid} aria-describedby={field.state.meta.errors.length ? 'category-name-error' : undefined} disabled={busy} />
            {field.state.meta.errors.length > 0 && <p id="category-name-error" className="error" role="alert">{field.state.meta.errors.join(' ')}</p>}
          </div>}</form.Field>
          <form.Field name="icon">{field => <fieldset className="category-options" disabled={busy}>
            <legend>Ícone</legend>
            <div className="category-icon-options">{Object.entries(categoryIcons).map(([key, { Icon, label }]) => <label className="category-option" key={key}>
              <input type="radio" name="category-icon" value={key} aria-label={label} checked={field.state.value === key} onChange={() => { if (isCategoryIcon(key)) field.handleChange(key) }} onBlur={field.handleBlur} />
              <span><Icon aria-hidden="true" /></span>
            </label>)}</div>
          </fieldset>}</form.Field>
          <form.Field name="color">{field => <fieldset className="category-options" disabled={busy}>
            <legend>Cor</legend>
            <div className="category-color-options">{Object.entries(categoryColors).map(([key, color]) => <label className="category-option" key={key}>
              <input type="radio" name="category-color" value={key} aria-label={color.label} checked={field.state.value === key} onChange={() => { if (isCategoryColor(key)) field.handleChange(key) }} onBlur={field.handleBlur} />
              <span><i style={{ backgroundColor: color.base }} /></span>
            </label>)}</div>
          </fieldset>}</form.Field>
          {error && <p className="error" role="alert">{error}</p>}
          <form.Subscribe selector={state => state.isSubmitting}>{submitting => <Button type="submit" disabled={submitting || busy}>{busy ? 'Salvando…' : error ? 'Tentar novamente' : 'Salvar'}</Button>}</form.Subscribe>
        </form>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
}

export function DeleteCategoryDialog({ category, onClose, restoreFocus }: Props & { category: Category }) {
  const [error, setError] = useState('')
  const { remove } = useCategoryMutations()
  const confirm = async () => {
    setError('')
    try { await remove.mutateAsync(category.id); onClose() }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Não foi possível excluir. Tente novamente.') }
  }
  return <AlertDialog.Root open onOpenChange={open => { if (!open && !remove.isPending) onClose() }}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay className="category-overlay" />
      <AlertDialog.Content className="category-dialog" onCloseAutoFocus={event => { event.preventDefault(); restoreFocus() }}>
        <div className="category-dialog-header"><div><AlertDialog.Title>Excluir categoria?</AlertDialog.Title><AlertDialog.Description>A categoria “{category.name}” será excluída. Categorias com transações precisam ser reclassificadas antes da exclusão.</AlertDialog.Description></div></div>
        {error && <p className="error" role="alert">{error}</p>}
        <div className="category-confirm-actions">
          <AlertDialog.Cancel asChild><Button variant="outline" disabled={remove.isPending}>Cancelar</Button></AlertDialog.Cancel>
          <Button variant="destructive" disabled={remove.isPending} onClick={() => void confirm()}>{remove.isPending ? 'Excluindo…' : error ? 'Tentar novamente' : 'Excluir'}</Button>
        </div>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
}
