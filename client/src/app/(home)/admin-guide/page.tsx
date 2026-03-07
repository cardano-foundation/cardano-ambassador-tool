"use client";

import DocsDisplay from "@/components/atoms/DocsDisplay";
import Paragraph from "@/components/atoms/Paragraph";
import { useUserAuth, useWalletManager } from "@/hooks";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AdminGuidePage() {
  const wallet = useWalletManager();
  const { isAdmin, isLoading: isAuthLoading } = useUserAuth({
    wallet: wallet.wallet,
    address: wallet.address,
    isConnected: wallet.isConnected,
  });
  const router = useRouter();
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);

  // Redirect non-admins only after auth has resolved
  useEffect(() => {
    if (!isAuthLoading && !isAdmin) {
      router.push("/unauthorized");
    }
  }, [isAdmin, isAuthLoading, router]);

  // Load markdown content when admin is confirmed
  useEffect(() => {
    if (isAdmin) {
      fetch("/api/docs/admin-guide")
        .then((res) => res.text())
        .then((text) => {
          setContent(text);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }
  }, [isAdmin]);

  if (loading || !isAdmin) {
    return (
      <div className="p-6">
        <Paragraph className="text-muted-foreground">Loading...</Paragraph>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {/* Main Content */}
      <div className="flex-1 p-6 md:p-12 max-w-5xl">
        <DocsDisplay content={content} />
      </div>

      {/* Sidebar Navigation */}
      <aside className="hidden lg:block w-56 border-l border-border p-6 sticky top-0 h-screen overflow-y-auto">
        <div className="space-y-6">
          <div>
            <Paragraph size="sm" className="font-medium text-foreground mb-3">
              Admin Guide
            </Paragraph>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#system-configuration"
                  className="text-primary-base hover:underline"
                >
                  System Configuration
                </a>
              </li>
              <li>
                <a
                  href="#managing-membership-applications"
                  className="text-primary-base hover:underline"
                >
                  Membership Applications
                </a>
              </li>
              <li>
                <a
                  href="#managing-proposal-applications"
                  className="text-primary-base hover:underline"
                >
                  Proposal Applications
                </a>
              </li>
              <li>
                <a
                  href="#treasury-sign-offs"
                  className="text-primary-base hover:underline"
                >
                  Treasury Sign-offs
                </a>
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
