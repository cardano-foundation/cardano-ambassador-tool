'use client';
import { AppLoadingScreen } from '@/components/AppLoadingScreen';
import Footer from '@/components/Footer';
import SideNav from '@/components/Navigation/SideNav';
import TopNavBar from '@/components/Navigation/TopNavBar';
import ToastContainer from '@/components/toast/toast';
import { AppProvider, useAppLoadingStatus } from '@/context/AppContext';
import { MeshProvider } from '@meshsdk/react';
import React from 'react';

function HomeContent({ children }: { children: React.ReactNode }) {
  const { shouldShowLoading } = useAppLoadingStatus();

  return (
    <>
      <AppLoadingScreen isVisible={shouldShowLoading} />
      <div className="flex min-h-screen">
        <SideNav />
        <div className="min-h-screen flex-1">
          <div className="sticky top-0 z-20">
            <TopNavBar />
          </div>
          {children}
          <ToastContainer />
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
  return (
    <MeshProvider>
      <AppProvider>
        <HomeContent>{children}</HomeContent>
      </AppProvider>
    </MeshProvider>
  );
}
