export function createClientSession(
  address: string,
  roles: { role: string }[],
) {
  if (typeof window === 'undefined') return null;

  const sessionData = {
    address,
    roles,
    timestamp: Date.now(),
  };

  localStorage.setItem('user_session', JSON.stringify(sessionData));
  return sessionData;
}

export function getClientSession() {
  if (typeof window === 'undefined') return null;

  try {
    const stored = localStorage.getItem('user_session');
    if (!stored) return null;

    const session = JSON.parse(stored);

    // Check if session is older than 24 hours
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - session.timestamp > twentyFourHours) {
      destroyClientSession();
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error reading client session:', error);
    destroyClientSession();
    return null;
  }
}

export function destroyClientSession() {
  localStorage.removeItem('user_session');
}
