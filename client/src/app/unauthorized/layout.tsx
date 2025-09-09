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

        <div className="min-h-screen flex-1">
          <div className="sticky top-0 z-20">
            <TopNavBar />
          </div>
          {children}
          <div className="sticky top-0 z-60">
            <ToastContainer />
          </div>
          <div className="bottom-0">
            <Footer />
          </div>
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
