/** Logo de l'écran de connexion : le cabinet, pas Payload. */
export function Logo() {
  return (
    <span className="wp-login-logo">
      <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 4v16M7 20h10M5 7h14" />
        <path d="M5 7 2.5 13a3 3 0 0 0 5 0L5 7ZM19 7l-2.5 6a3 3 0 0 0 5 0L19 7Z" />
      </svg>
      <span className="wp-login-logo__title">Administration du cabinet</span>
    </span>
  );
}
