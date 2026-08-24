import { getTrialState } from '@/lib/services/trial-access';
import { getMarkets, type Market } from '@/lib/markets/getMarkets';
import {
  getTerminalLevels,
  DEFAULT_SYMBOL,
  DEFAULT_TIMEFRAME,
  type TerminalLevels,
} from '@/lib/levels/terminalLevels';
import Terminal from '@/components/terminal/Terminal';

// Force per-request rendering — the trial state depends on cookies & session.
export const dynamic = 'force-dynamic';

// Owners who can upload proof screenshots (matches /api/admin/results).
const ADMIN_EMAILS = ['raul@sacredlevels.com', 'alarconalvarez33@gmail.com'];

/**
 * Upstream budget for the first paint. Prices and levels are worth waiting a
 * moment for, but never worth blocking the page on: past the deadline we ship
 * the shell and the client picks the data up on its own.
 */
const SNAPSHOT_BUDGET_MS = 2_500;

async function withBudget<T>(work: Promise<T>, label: string): Promise<T | null> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const deadline = new Promise<null>(resolve => {
    timer = setTimeout(() => {
      console.warn(`${label} exceeded ${SNAPSHOT_BUDGET_MS}ms — deferring to the client`);
      resolve(null);
    }, SNAPSHOT_BUDGET_MS);
  });

  try {
    return await Promise.race([work, deadline]);
  } catch (e) {
    console.error(`${label} failed:`, (e as Error).message);
    return null;
  } finally {
    clearTimeout(timer);
  }
}

export default async function Home() {
  const trial = await getTrialState();
  const isAdmin = !!trial.email && ADMIN_EMAILS.includes(trial.email);

  // Render the first snapshot server-side. Without this the terminal used to
  // paint every price slot as "—" and only fill in after the JS bundle
  // downloaded, hydrated, and a client fetch resolved — several seconds on
  // mobile, which reads as a broken site.
  const [snapshot, levels] = await Promise.all([
    withBudget(getMarkets(), 'initial markets snapshot'),
    withBudget(
      getTerminalLevels(DEFAULT_SYMBOL, DEFAULT_TIMEFRAME, trial),
      'initial levels snapshot',
    ),
  ]);

  const initialMarkets: Market[] = snapshot?.markets ?? [];
  const initialLevels: TerminalLevels | null = levels;

  return (
    <Terminal
      userEmail={trial.email}
      isAuthed={trial.isAuthed}
      isPremium={trial.isPremium}
      isAdmin={isAdmin}
      trialStartedAt={trial.trialStartedAt}
      trialEndsAt={trial.trialEndsAt}
      initialMarkets={initialMarkets}
      initialLevels={initialLevels}
    />
  );
}
