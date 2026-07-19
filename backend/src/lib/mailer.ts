import nodemailer from 'nodemailer';

export interface SmtpConfig {
  host: string;
  port: number;
  user?: string | null;
  password?: string | null;
}

export function createTransport(config: SmtpConfig) {
  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: config.user ? { user: config.user, pass: config.password ?? undefined } : undefined,
  });
}

export async function verifySmtpConnection(config: SmtpConfig) {
  const transport = createTransport(config);
  await transport.verify();
}

export async function sendMail(
  config: SmtpConfig,
  options: { from: string; to: string; subject: string; text: string },
) {
  const transport = createTransport(config);
  await transport.sendMail(options);
}
