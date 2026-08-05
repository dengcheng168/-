interface WhatsappSettings {
  whatsappLink: string | null;
  whatsappNumber: string | null;
}

export function getWhatsappHref(settings: WhatsappSettings, message?: string): string | null {
  const base = settings.whatsappLink
    ? settings.whatsappLink
    : settings.whatsappNumber
      ? `https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, '')}`
      : null;
  if (!base) return null;
  if (!message) return base;
  const separator = base.includes('?') ? '&' : '?';
  return `${base}${separator}text=${encodeURIComponent(message)}`;
}
