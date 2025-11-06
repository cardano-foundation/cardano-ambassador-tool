'use client';
import { AppLoadingScreen } from '@/components/AppLoadingScreen';
import Footer from '@/components/Footer';
import SideNav from '@/components/Navigation/SideNav';
import TopNavBar from '@/components/Navigation/TopNavBar';
import ToastContainer from '@/components/toast/toast';
import { useApp } from '@/context/AppContext';
import React from 'react';

function HomeContent({ children }: { children: React.ReactNode }) {
  const { shouldShowLoading } = useApp();

  return (
    <>
      <AppLoadingScreen isVisible={shouldShowLoading} />
      <div className="flex min-h-screen">
        <div className="sticky top-0 z-20">
          <SideNav />
        </div>

        <div className="flex h-screen min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 flex-shrink-0">
            <TopNavBar />
          </div>
          <main className="flex-1 overflow-auto">
            <div className="min-h-screen">{children}</div>
            <Footer />
          </main>
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
  return <HomeContent>{children}</HomeContent>;
}
