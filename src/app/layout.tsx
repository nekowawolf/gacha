import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '@/styles/globals.css';
import { GachaProvider } from '@/hooks/useGacha';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Gacha — Let chance spark something.',
  description:
    'Your personal gacha studio for ideas, designs, projects, and everyday decisions. Set your options, reveal the cards, and discover new possibilities.',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-icon.png',
  },
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function() {
              try {
                if (localStorage.getItem("darkmode") === "active") {
                  document.documentElement.classList.add("darkmode");
                }
              } catch (e) {}
            })();`,
          }}
        />
      </head>
      <body className={`${inter.variable} min-h-screen`}>
        <GachaProvider>
          {children}
        </GachaProvider>
      </body>
    </html>
  );
}