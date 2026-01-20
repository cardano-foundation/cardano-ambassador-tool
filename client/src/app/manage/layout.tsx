'use client';

import { AppLoadingScreen } from '@/components/AppLoadingScreen';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Footer from '@/components/Footer';
import SideNav from '@/components/navigation/SideNav';
import TopNavBar from '@/components/navigation/TopNavBar';
import ToastContainer from '@/components/toast/Toast';
import { useAppLoading } from '@/hooks';
import React from 'react';

function ManageContent({ children }: { children: React.ReactNode }) {
  const { shouldShowLoading } = useAppLoading();

  return (
    <>
      <AppLoadingScreen isVisible={shouldShowLoading} />
      <div className="flex h-screen w-screen overflow-hidden">
        <div className="shrink-0">
          <SideNav />
        </div>
        <div className="flex h-screen min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 shrink-0">
            <TopNavBar />
          </div>

          <main className="flex-1 overflow-auto">
            <ProtectedRoute requireAdmin={true} requireAuth={true}>
              <div className="min-h-screen">{children}</div>
            </ProtectedRoute>
            <Footer />
          </main>

          <ToastContainer />
        </div>
      </div>
    </>
  );
}

export default ManageContent;
