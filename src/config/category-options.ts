import { BaggageClaim, BookOpen, BriefcaseBusiness, CarFront, Dumbbell, Gift, HeartPulse, House, Mailbox, PawPrint, PiggyBank, ReceiptText, ShoppingCart, Ticket, ToolCase, Utensils } from 'lucide-react'

// Chaves persistidas e correspondência visual verificadas em DESIGN.md.
export const categoryColors = {
  green: { label: 'Verde', base: '#16A34A', dark: '#15803D', light: '#E0FAE9' },
  blue: { label: 'Azul', base: '#2563EB', dark: '#1D4ED8', light: '#DBEAFE' },
  purple: { label: 'Roxo', base: '#9333EA', dark: '#7E22CE', light: '#F3E8FF' },
  pink: { label: 'Rosa', base: '#DB2777', dark: '#BE185D', light: '#FCE7F3' },
  red: { label: 'Vermelho', base: '#DC2626', dark: '#B91C1C', light: '#FEE2E2' },
  orange: { label: 'Laranja', base: '#EA580C', dark: '#C2410C', light: '#FFEDD5' },
  yellow: { label: 'Amarelo', base: '#CA8A04', dark: '#A16207', light: '#F7F3CA' },
}
export const categoryIcons = {
  'briefcase-business': { label: 'Maleta de trabalho', Icon: BriefcaseBusiness },
  'car-front': { label: 'Carro', Icon: CarFront },
  'heart-pulse': { label: 'Coração com pulso', Icon: HeartPulse },
  'piggy-bank': { label: 'Cofrinho', Icon: PiggyBank },
  'shopping-cart': { label: 'Carrinho de compras', Icon: ShoppingCart },
  ticket: { label: 'Ingresso', Icon: Ticket },
  'tool-case': { label: 'Caixa de ferramentas', Icon: ToolCase },
  utensils: { label: 'Talheres', Icon: Utensils },
  'paw-print': { label: 'Pata', Icon: PawPrint },
  house: { label: 'Casa', Icon: House },
  gift: { label: 'Presente', Icon: Gift },
  dumbbell: { label: 'Haltere', Icon: Dumbbell },
  'book-open': { label: 'Livro aberto', Icon: BookOpen },
  'baggage-claim': { label: 'Carrinho de bagagem', Icon: BaggageClaim },
  mailbox: { label: 'Caixa de correio', Icon: Mailbox },
  'receipt-text': { label: 'Recibo', Icon: ReceiptText },
}
export type CategoryColor = keyof typeof categoryColors
export type CategoryIcon = keyof typeof categoryIcons
export function isCategoryColor(value: string): value is CategoryColor { return Object.hasOwn(categoryColors, value) }
export function isCategoryIcon(value: string): value is CategoryIcon { return Object.hasOwn(categoryIcons, value) }
