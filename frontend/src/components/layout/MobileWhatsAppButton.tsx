import { SOCIAL_ICONS } from './SocialIcons';

const WhatsAppIcon = SOCIAL_ICONS.whatsapp;

export function MobileWhatsAppButton({ href }: { href: string | null }) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat on WhatsApp"
      className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-colors hover:bg-[#1ebe5d]"
    >
      <WhatsAppIcon className="h-7 w-7" />
    </a>
  );
}
