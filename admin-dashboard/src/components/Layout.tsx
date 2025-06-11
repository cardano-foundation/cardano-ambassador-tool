import React from 'react';
import Link from 'next/link';
import { MeshBadge } from "@meshsdk/react";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="bg-gray-900 min-h-screen text-white">
      <nav className="bg-gray-800 p-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-xl font-bold">
            Cardano Ambassador Tool
          </Link>
          <div className="space-x-4">
            <Link 
              href="/" 
              className="text-gray-300 hover:text-white px-3 py-2 rounded-md"
            >
              Home
            </Link>
            <Link 
              href="/admin" 
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Admin Dashboard
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>

      <footer className="bg-gray-800 p-8 border-t border-gray-700">
        <div className="max-w-7xl mx-auto flex justify-center">
          <MeshBadge isDark={true} />
        </div>
      </footer>
    </div>
  );
};

export default Layout; 