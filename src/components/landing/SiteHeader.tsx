import Image from 'next/image';
import Link from 'next/link';

import type { TrialState } from '@/lib/services/trial-access';

/**
 * Header for every page on the light "Marcador Verde" identity.
 *
 * The trial state arrives as a prop rather than being read here: the pages that
 * render this already resolve it for their own gating, and getTrialState() hits
 * the session plus a Prisma query on each call.
 *
 * Section links are absolute (`/#niveles`) so the header works from any route.
 * On the home page the browser still treats them as same-document jumps, so
 * nothing reloads.
 */
export default function SiteHeader({ trial }: { trial: TrialState }) {
  const initial = (trial.email?.trim()?.[0] ?? 'T').toUpperCase();
  const displayName = trial.email ? trial.email.split('@')[0] : '';

  return (
    <header className="top">
      <div className="wrap top-in">
        <Link href="/" aria-label="Trading.com.py — inicio">
          <Image
            src="/logonuevos.png"
            alt="Trading.com.py"
            width={993}
            height={238}
            priority
            className="logo"
          />
        </Link>

        <nav className="nav">
          <a href="/#niveles">Niveles de hoy</a>
          <a href="/#buscas">¿Qué buscás?</a>
          <a href="/#estrategias">Estrategias</a>
          <a href="/#mentoria">Mentoría</a>
          <a href="/#contacto">Contacto</a>
        </nav>

        {trial.isAuthed ? (
          <div className="auth">
            <div className="hola">
              <span className="avatar" aria-hidden="true">{initial}</span>
              <span className="hola-txt">
                <b>Hola, {displayName}</b>
                <small>
                  {trial.isPremium
                    ? 'Cuenta vinculada · acceso completo'
                    : trial.inTrial
                      ? 'Acceso de prueba activo'
                      : 'Acceso al plan abierto'}
                </small>
              </span>
            </div>
            <Link href="/account" className="salir">Mi cuenta</Link>
          </div>
        ) : (
          <div className="auth">
            <Link href="/login" className="link-login">Iniciar sesión</Link>
            <Link href="/register" className="btn">Registrarse</Link>
          </div>
        )}
      </div>
    </header>
  );
}
