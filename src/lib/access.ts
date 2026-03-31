export function hasActiveAccess(user: { plan: string | null; role?: string | null }): boolean {
  if (user.role === 'admin') return true
  const PAID_PLANS = ['quantum']
  return PAID_PLANS.includes(user.plan ?? '')
}
