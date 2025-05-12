import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Real Estate Platform',
  description: 'Find your dream home with our AI-powered real estate platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <header className="bg-blue-600 text-white p-4">
          <div className="container mx-auto flex justify-between items-center">
            <h1 className="text-2xl font-bold">Dream Home Finder</h1>
            <nav>
              <ul className="flex space-x-6">
                <li><a href="/" className="hover:underline">Home</a></li>
                <li><a href="/property" className="hover:underline">Properties</a></li>
                <li><a href="/search" className="hover:underline">Search</a></li>
                <li><a href="/ai-agent" className="hover:underline">AI Agent</a></li>
                <li><a href="/contact" className="hover:underline">Contact</a></li>
              </ul>
            </nav>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8">
          {children}
        </main>
        <footer className="bg-gray-100 p-6">
          <div className="container mx-auto text-center">
            <p>© {new Date().getFullYear()} Dream Home Finder. All rights reserved.</p>
          </div>
        </footer>
      </body>
    </html>
  );
} 