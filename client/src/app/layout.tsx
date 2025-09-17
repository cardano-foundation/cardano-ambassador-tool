'use client';

import { AppProvider } from '@/context/AppContext';
import 'leaflet/dist/leaflet.css';

import type { Metadata } from 'next';
import './app.css';

// export const metadata: Metadata = {
//   title: 'Cardano Ambassador Tool',
//   description:
//     'Discover the passionate individuals shaping the Cardano ecosystem. From developers and educators to community organizers, these ambassadors are driving innovation, connection, and real-world impact.',
//   keywords: [
//     'Cardano',
//     'Ambassador',
//     'Blockchain',
//     'Cryptocurrency',
//     'Community',
//   ],
//   authors: [{ name: 'Cardano Ambassador Team' }],
// };

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
            __html: `
              // Prevent flash of incorrect theme
              (function() {
                try {
                  const root = document.documentElement;
                  const theme = localStorage.getItem('theme');
                  
                  // Clear any existing theme classes first
                  root.classList.remove('light', 'dark');
                  
                  if (theme === 'dark') {
                    root.classList.add('dark');
                  } else if (theme === 'light') {
                    root.classList.add('light');
                  } else {
                    // System preference
                    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    root.classList.add(prefersDark ? 'dark' : 'light');
                  }
                } catch (e) {
                  // Fallback to light theme
                  document.documentElement.classList.add('light');
                }
              })();
            `,
          }}
        />
      </head>
      <body>
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
