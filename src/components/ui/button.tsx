import type { ComponentProps } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'
import { cn } from '../../lib/utils'

const buttonVariants = cva('button', {
  variants: { variant: { default: 'button-primary', outline: 'button-outline', destructive: 'button-danger', ghost: 'button-ghost' } },
  defaultVariants: { variant: 'default' },
})

export function Button({ className, variant, asChild = false, ...props }: ComponentProps<'button'> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : 'button'
  return <Comp data-slot="button" className={cn(buttonVariants({ variant }), className)} {...props} />
}
