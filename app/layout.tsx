import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Planning Poker',
  description: 'Agile estimation for remote SCRUM teams',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
