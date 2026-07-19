import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'OEM & ODM Water Purifier Manufacturer',
    template: '%s | Water Purifier Factory',
  },
  description:
    'Reliable water purification solutions for global brands, distributors and commercial projects.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
