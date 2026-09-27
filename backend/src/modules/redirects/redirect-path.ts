/** Redirects are exact, same-site paths; never accept protocols or query payloads. */
export function isRedirectPath(path: string): boolean {
  return path.length <= 2048 && /^\/[A-Za-z0-9/_.-]*$/.test(path)
    && !path.includes('//') && !path.split('/').some((part) => part === '.' || part === '..')
    && !/^\/(?:admin|auth|api|_next|uploads)(?:\/|$)/.test(path);
}
