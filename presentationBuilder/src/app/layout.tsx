'use client';

import './globals.css';
import { Inter } from 'next/font/google';
import { ToastProvider } from '@/components/ui/toast';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <ToastProvider>
                    {children}
                </ToastProvider>
            </body>
        </html>
    );
}
