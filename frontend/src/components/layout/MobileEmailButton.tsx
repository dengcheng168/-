export function MobileEmailButton({ email }: { email: string | null }) {
  if (!email) return null;

  return (
    <a
      href={`mailto:${email}`}
      aria-label="Email us"
      className="fixed bottom-24 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-navy-950 text-white shadow-lg transition-colors hover:bg-navy-900"
    >
      <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="4" width="20" height="16" rx="2" />
        <path d="m22 6-10 7L2 6" />
      </svg>
    </a>
  );
}
