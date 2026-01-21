import { Analytics } from "@vercel/analytics/react"
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from '@/components/providers/WalletContextProvider';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';
import { AuthWrapper } from '@/components/auth/AuthWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CreateMeme.io | Create Solana Tokens',
  description: 'Launch your meme coin on Solana in seconds. No coding required.',
  verification: {
    google: 'sjmUtH2TExW3VIZCWiCjuXm8mM71l_H7b0ST5Ntj_zE',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <NextAuthProvider>
          <WalletContextProvider>
            <AuthWrapper>
              {children}
            </AuthWrapper>
            <Analytics />
          </WalletContextProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
