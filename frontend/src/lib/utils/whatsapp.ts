interface WhatsappSettings {
  whatsappLink: string | null;
  whatsappNumber: string | null;
}

export function getWhatsappHref(settings: WhatsappSettings): string | null {
  if (settings.whatsappLink) return settings.whatsappLink;
  if (settings.whatsappNumber) return `https://wa.me/${settings.whatsappNumber.replace(/[^\d]/g, '')}`;
  return null;
}
