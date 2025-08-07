import Footer from '@/components/Footer';
import SideNav from '@/components/Navigation/SideNav';
import TopNavBar from '@/components/Navigation/TopNavBar';
import { ThemeProvider } from '@/components/ThemeToggle';
import ToastContainer from '@/components/toast/toast';
import React from 'react';
import '../app.css';

export default function HomeLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Prevent flash of incorrect theme
              try {
                const theme = localStorage.getItem('theme');
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else if (theme === 'light') {
                  document.documentElement.classList.add('light');
                } else {
                  // System preference
                  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
                    document.documentElement.classList.add('dark');
                  }
                }
              } catch {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeProvider>
          <div className="flex min-h-screen">
            <SideNav />
            <div className="flex min-h-screen flex-1 flex-col">
              <div className="sticky top-0 z-20">
                <TopNavBar />
              </div>
              <main className="flex-1">{children}</main>
              <Footer />
              <ToastContainer />
            </div>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
