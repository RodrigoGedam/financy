export function Logo({ compact = false }: { compact?: boolean }) {
  return <img src={compact ? '/assets/financy-logo-compact.svg' : '/assets/financy-logo.svg'} alt="Financy" width={compact ? 100 : 134} height={compact ? 24 : 32} />
}
