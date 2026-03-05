// Admin - can modify everything (signals, levels, etc.)
export const ADMIN_EMAILS = ['raul@sacredlevels.com']

// VIP - full content access but NO admin permissions
export const VIP_EMAILS = [
  'delcypp66@gmail.com',
  'robertosanchezgill@gmail.com','wilfridoerwin32@gmail.com'
]

/** Returns true only for raul — can modify admin panels */
export const isAdmin = (email: string | null | undefined): boolean =>
  ADMIN_EMAILS.includes(email || '')

/** Returns true for admin OR VIP — full content access, no modification rights */
export const hasFullAccess = (email: string | null | undefined): boolean =>
  ADMIN_EMAILS.includes(email || '') || VIP_EMAILS.includes(email || '')
