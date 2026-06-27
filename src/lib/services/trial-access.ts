/**
 * Unified trial + subscription gating.
 *
 * Rules:
 *   - Anyone (anonymous or registered) gets a 24h free trial.
 *     · Anonymous: tracked by the sl_trial_start cookie (middleware sets it
 *       on first request).
 *     · Registered: trial starts at User.createdAt, capped against the
 *       cookie if it predates the account (so registering doesn't
 *       reset/extend the trial).
 *   - Premium users (admin OR plan in PAID_PLANS with active subscription
 *     and premiumUntil in the future) always pass.
 *
 * Used by server pages, route handlers, and middleware.
 */

import 'server-only';
import { cookies } from 'next/headers';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import type { NextRequest } from 'next/server';

export const TRIAL_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours
export const TRIAL_COOKIE = 'sl_trial_start';

const PAID_PLANS = new Set(['pro', 'quantum', 'signal_hub', 'whale', 'ser', 'ser-plus']);
const ADMIN_EMAIL = 'raul@sacredlevels.com';

export interface TrialState {
  isAuthed: boolean;
  isPremium: boolean;
  inTrial: boolean;
  trialStartedAt: number | null;
  trialEndsAt: number | null;
  email: string | null;
}

function readCookieValue(req?: NextRequest): string | null {
  if (req) return req.cookies.get(TRIAL_COOKIE)?.value || null;
  try { return cookies().get(TRIAL_COOKIE)?.value || null; }
  catch { return null; }
}

/** Resolve the trial / premium status of the current visitor. */
export async function getTrialState(req?: NextRequest): Promise<TrialState> {
  const session = await getServerSession(authOptions);
  const now = Date.now();

  let isAuthed = false;
  let isPremium = false;
  let registeredAt: number | null = null;
  let email: string | null = null;

  if (session?.user?.email) {
    isAuthed = true;
    email = session.user.email;
    const user = await prisma.user.findUnique({
      where: { email },
      select: { createdAt: true, role: true, plan: true, isPremium: true, premiumUntil: true, subscriptionStatus: true },
    });
    if (user) {
      registeredAt = user.createdAt.getTime();
      const adminBypass = email === ADMIN_EMAIL || user.role === 'admin';
      const hasPlan    = PAID_PLANS.has(user.plan ?? '');
      const stillValid = user.premiumUntil ? user.premiumUntil > new Date() : false;
      const active     = user.subscriptionStatus === 'active';
      isPremium = adminBypass || (hasPlan && user.isPremium === true && stillValid && active);
    }
  }

  // Combine cookie + registration timestamps. Trial starts at the EARLIER of
  // the two when both exist (so registering doesn't reset the trial).
  const cookieVal = readCookieValue(req);
  const cookieTs = cookieVal ? parseInt(cookieVal, 10) : NaN;
  const cookieValid = Number.isFinite(cookieTs) && cookieTs > 0 && cookieTs <= now + 1000;

  let trialStartedAt: number | null = null;
  if (cookieValid && registeredAt != null) trialStartedAt = Math.min(cookieTs, registeredAt);
  else if (cookieValid)                    trialStartedAt = cookieTs;
  else if (registeredAt != null)           trialStartedAt = registeredAt;

  // No cookie + no account = brand new anonymous visitor — trial starts now.
  // The middleware will set the cookie so subsequent requests are anchored.
  if (trialStartedAt == null) trialStartedAt = now;

  const trialEndsAt = trialStartedAt + TRIAL_DURATION_MS;
  const inTrial = !isPremium && trialEndsAt > now;

  return { isAuthed, isPremium, inTrial, trialStartedAt, trialEndsAt, email };
}

/** Convenience: true when the request should see premium content. */
export function hasFullAccess(state: TrialState): boolean {
  return state.isPremium || state.inTrial;
}
