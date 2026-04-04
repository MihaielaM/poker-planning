import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Planning Poker',
  description: 'Estimare agilă pentru echipe SCRUM remote',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>{children}</body>
    </html>
  );
}
