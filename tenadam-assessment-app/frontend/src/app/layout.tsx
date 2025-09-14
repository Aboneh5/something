import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/AuthContext';
import Image from 'next/image';
import TenadamLogo from '@/Tenadam Logo.png';
import BaldrigeLogo from '@/Baldrige.png';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Baldrige Excellence Framework Assessment App by Tenadam Training, Consultancy and Research PLC.',
  description: 'A web application for the Baldrige Excellence Framework Assessment.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <header className="bg-white shadow-md">
            <nav className="container mx-auto px-6 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Image src={TenadamLogo} alt="Tenadam Logo" width={100} height={50} />
                  <a href="/" className="text-gray-800 hover:text-gray-700 text-xl font-semibold text-gray-700 ml-4">
                    Tenadam Training, Consultancy and Research PLC
                  </a>
                </div>
                <Image src={BaldrigeLogo} alt="Baldrige Logo" width={300} height={150} />
              </div>
            </nav>
          </header>
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}