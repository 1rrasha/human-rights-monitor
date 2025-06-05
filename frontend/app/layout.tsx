'use client';

import type React from 'react';
import { Inter, Montserrat, Roboto_Mono } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

// Font configuration
const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
});

const robotoMono = Roboto_Mono({
  subsets: ['latin'],
  variable: '--font-roboto-mono',
  display: 'swap',
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${montserrat.variable} ${robotoMono.variable}`}
    >
      <head>
        <title>Human Rights Monitor</title>
        <meta name="description" content="Monitor and report human rights violations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="keywords" content="human rights, monitoring, violations, reporting" />
        <meta name="author" content="Human Rights Monitor Team" />
        <link rel="icon" href="/human_logo.png" />
        <meta property="og:title" content="Human Rights Monitor" />
        <meta property="og:description" content="Monitor and report human rights violations" />
        <meta property="og:url" content="https://humanrightsmonitor.org" />
        <meta property="og:site_name" content="Human Rights Monitor" />
        <meta property="og:image" content="/og-image.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Human Rights Monitor" />
        <meta property="og:locale" content="en_US" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Human Rights Monitor" />
        <meta name="twitter:description" content="Monitor and report human rights violations" />
        <meta name="twitter:image" content="/twitter-image.png" />
      </head>
      <body className="font-sans antialiased">
        <AuthProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <main className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
              <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
            </main>
            <Toaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}