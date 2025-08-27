'use client';

import { AppLoadingScreen } from '@/components/AppLoadingScreen';
import Footer from '@/components/Footer';
import SideNav from '@/components/Navigation/SideNav';
import TopNavBar from '@/components/Navigation/TopNavBar';
import { NetworkErrorBanner } from '@/components/NetworkErrorBanner';
import ToastContainer from '@/components/toast/toast';
import { AppProvider, useAppLoadingStatus } from '@/context/AppContext';
import { MeshProvider } from '@meshsdk/react';
import React from 'react';

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { shouldShowLoading } = useAppLoadingStatus();

  return (
    <>
      <AppLoadingScreen isVisible={shouldShowLoading} />
      <div className="flex min-h-screen">
        <SideNav />
        <div className="flex min-h-screen flex-1 flex-col">
          <div className="sticky top-0 z-20">
            <TopNavBar />
          </div>
          <div className="px-6 pt-4">
            <NetworkErrorBanner />
          </div>
          <main className="flex-1">{children}</main>
          <Footer />
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
  return (
    <MeshProvider>
      <AppProvider>
        <DashboardContent>{children}</DashboardContent>
      </AppProvider>
    </MeshProvider>
  );
}
