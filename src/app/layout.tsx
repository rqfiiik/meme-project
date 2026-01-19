import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletContextProvider } from '@/components/providers/WalletContextProvider';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CreateMeme.io | Create Solana Tokens',
  description: 'Launch your meme coin on Solana in seconds. No coding required.',
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
            {children}
          </WalletContextProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
