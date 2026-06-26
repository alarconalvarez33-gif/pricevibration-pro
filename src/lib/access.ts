export function hasActiveAccess(user: { plan: string | null; role?: string | null }): boolean {
  if (user.role === 'admin') return true
  // 'pro' is the new Sacred Levels Terminal plan; 'quantum' is the legacy one.
  // Both grant full access to calculators (Quantum, SER, Hub, levels).
  const PAID_PLANS = ['pro', 'quantum']
  return PAID_PLANS.includes(user.plan ?? '')
}
