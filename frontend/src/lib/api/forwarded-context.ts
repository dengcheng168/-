import { isIP } from 'node:net';

/** Enable only when Next is reachable solely through a trusted appending proxy.
 * Preserve the entire chain: the API's trustProxy policy resolves it right-to-left.
 * Selecting the leftmost address here would trust spoofed client input.
 */
export function forwardedContext(source: Pick<Headers, 'get'>, enabled: boolean): Record<string, string> {
  const result: Record<string, string> = {};
  const userAgent = source.get('user-agent');
  if (userAgent) result['user-agent'] = userAgent.slice(0, 512);
  if (!enabled) return result;
  const raw = source.get('x-forwarded-for');
  if (!raw || raw.length > 2048) return result;
  const chain = raw.split(',').map((part) => part.trim());
  if (chain.length <= 16 && chain.every((address) => isIP(address) !== 0)) {
    result['x-forwarded-for'] = chain.join(', ');
  }
  return result;
}
