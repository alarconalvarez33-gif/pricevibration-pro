import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Terminal from '@/components/terminal/Terminal';

const ADMIN_EMAIL = 'raul@sacredlevels.com';
const PAID_PLANS = new Set(['pro', 'quantum', 'signal_hub', 'whale', 'ser', 'ser-plus']);

export default async function Home() {
  const session = await getServerSession(authOptions);

  // Logged-out → bounce to login (terminal is gated)
  if (!session?.user?.email) {
    redirect('/login?callbackUrl=%2F');
  }

  // Resolve subscription status server-side. Premium = active plan + isPremium + premiumUntil > now + status=active
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      email: true, role: true, plan: true, isPremium: true,
      premiumUntil: true, subscriptionStatus: true,
    },
  });

  let isPremium = false;
  if (user) {
    const adminBypass = user.email === ADMIN_EMAIL || user.role === 'admin';
    const hasPlan    = PAID_PLANS.has(user.plan ?? '');
    const stillValid = user.premiumUntil ? user.premiumUntil > new Date() : false;
    const active     = user.subscriptionStatus === 'active';
    isPremium = adminBypass || (hasPlan && user.isPremium === true && stillValid && active);
  }

  return <Terminal userEmail={session.user.email} isPremium={isPremium} />;
}
