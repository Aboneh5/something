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
          {/* Assessment Hub Navigation */}
          <div className="bg-emerald-600 text-white py-2">
            <div className="container mx-auto px-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <a 
                    href="http://localhost:3010" 
                    className="flex items-center space-x-2 text-emerald-100 hover:text-white transition-colors"
                    target="_blank"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    <span className="text-sm font-medium">Back to Assessment Hub</span>
                  </a>
                </div>
                
                <div className="flex items-center space-x-6 text-sm">
                  <span className="text-emerald-100">
                    Currently in: <span className="font-semibold">Baldrige Assessment</span>
                  </span>
                  
                  <a 
                    href="http://localhost:3010/auth/signin" 
                    className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
                    target="_blank"
                  >
                    Switch to OCAI
                  </a>
                </div>
              </div>
            </div>
          </div>

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