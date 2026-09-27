import 'server-only';
import { headers } from 'next/headers';
import { forwardedContext } from './forwarded-context';

export async function requestContextHeaders(): Promise<Record<string, string>> {
  return forwardedContext(await headers(), process.env.FORWARD_CLIENT_IP === 'true');
}
