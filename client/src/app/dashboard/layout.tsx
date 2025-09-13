'use client';

import { AppLoadingScreen } from '@/components/AppLoadingScreen';
import Footer from '@/components/Footer';
import SideNav from '@/components/Navigation/SideNav';
import TopNavBar from '@/components/Navigation/TopNavBar';
import ToastContainer from '@/components/toast/toast';
import { useApp } from '@/context/AppContext';
import React from 'react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { shouldShowLoading } = useApp();

  return (
    <>
      <AppLoadingScreen isVisible={shouldShowLoading} />
      <div className="flex h-screen overflow-hidden">
        <div className="flex-shrink-0">
          <SideNav />
        </div>
        <div className="flex flex-1 flex-col min-w-0 h-screen">
          <div className="flex-shrink-0 sticky top-0 z-20">
            <TopNavBar />
          </div>
          <main className="flex-1 overflow-auto">
            {children}
            <Footer />
          </main>
          <ToastContainer />
        </div>
      </div>
    </>
  );
}

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <DashboardContent>{children}</DashboardContent>;
}
