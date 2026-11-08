import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'KUKU STORYPULSE — AI Microdrama Promo Discovery & Ranking',
  description: 'Turn every microdrama screenplay into its next viral hook. Advanced editorial intelligence, narrative knowledge graphs, and explainable Promo DNA scoring.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}

