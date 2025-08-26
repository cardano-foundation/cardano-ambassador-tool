'use client';

import Footer from '@/components/Footer';
import SideNav from '@/components/Navigation/SideNav';
import TopNavBar from '@/components/Navigation/TopNavBar';
import { AppLoadingScreen } from '@/components/AppLoadingScreen';
import ToastContainer from '@/components/toast/toast';
import { AppProvider, useAppLoading } from '@/context/AppContext';
import { MeshProvider } from '@meshsdk/react';
import React from 'react';
import '../app.css';

function ManageContent({ children }: { children: React.ReactNode }) {
  const { shouldShowLoading } = useAppLoading();

  return (
    <>
      <AppLoadingScreen isVisible={shouldShowLoading} />
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
    </>
  );
}

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
        <MeshProvider>
          <AppProvider>
            <ManageContent>{children}</ManageContent>
          </AppProvider>
        </MeshProvider>
      </body>
    </html>
  );
}
