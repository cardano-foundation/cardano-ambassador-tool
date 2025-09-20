'use client';

import { AppLoadingScreen } from '@/components/AppLoadingScreen';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import Footer from '@/components/Footer';
import SideNav from '@/components/Navigation/SideNav';
import TopNavBar from '@/components/Navigation/TopNavBar';
import ToastContainer from '@/components/toast/toast';
import { useApp } from '@/context';
import React from 'react';

function ManageContent({ children }: { children: React.ReactNode }) {
  const { shouldShowLoading } = useApp();

  return (
    <>
      <AppLoadingScreen isVisible={shouldShowLoading} />
      <div className="flex h-screen overflow-hidden">
        <div className="flex-shrink-0">
          <SideNav />
        </div>
        <div className="flex h-screen min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 flex-shrink-0">
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
