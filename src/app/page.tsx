import { getTrialState } from '@/lib/services/trial-access';
import Terminal from '@/components/terminal/Terminal';

// Force per-request rendering — the trial state depends on cookies & session.
export const dynamic = 'force-dynamic';

// Owners who can upload proof screenshots (matches /api/admin/results).
const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com'];

export default async function Home() {
  const trial = await getTrialState();
  const isAdmin = !!trial.email && ADMIN_EMAILS.includes(trial.email);

  return (
    <Terminal
      userEmail={trial.email}
      isAuthed={trial.isAuthed}
      isPremium={trial.isPremium}
      isAdmin={isAdmin}
      trialStartedAt={trial.trialStartedAt}
      trialEndsAt={trial.trialEndsAt}
    />
  );
}
