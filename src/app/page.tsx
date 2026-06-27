import { getTrialState } from '@/lib/services/trial-access';
import Terminal from '@/components/terminal/Terminal';

// Force per-request rendering — the trial state depends on cookies & session.
export const dynamic = 'force-dynamic';

export default async function Home() {
  const trial = await getTrialState();

  return (
    <Terminal
      userEmail={trial.email}
      isAuthed={trial.isAuthed}
      isPremium={trial.isPremium}
      trialStartedAt={trial.trialStartedAt}
      trialEndsAt={trial.trialEndsAt}
    />
  );
}
