"use client";

import TopNav from "@/components/Navigation/TabNav";
import SimpleCardanoLoader from "@/components/SimpleCardanoLoader";
import Button from "@/components/atoms/Button";
import { routes } from "@/config/routes";
import { useDatabase, useWalletManager } from "@/hooks";
import Link from "next/link";
import { useState } from "react";
import MembershipSubmissionsTab from "../_components/membership/MembershipSubmissionsTab";
import ProposalSubmissionsTab from "../_components/proposals/ProposalSubmissionsTab";
export default function IntentSubmissionsPage() {
  const tabs = [
    { id: "membership-intent", label: "Membership Application" },
    { id: "proposal-intent", label: "Proposal" },
  ];

  const [activeTab, setActiveTab] = useState("membership-intent");
  const { dbLoading } = useDatabase();
  const { isConnected } = useWalletManager();

  if (dbLoading || !isConnected) {
    return <SimpleCardanoLoader />;
  }

  return (
    <div className="space-y-4 px-4 py-2 pb-8 sm:space-y-6 sm:px-6">
      <div className="border-border bg-card border-b">
        <div className="flex items-end justify-between">
          <div className="flex-1">
            <TopNav
              tabs={tabs}
              activeTabId={activeTab}
              onTabChange={setActiveTab}
              className="w-1/2"
            />
          </div>
        </div>
      </div>

      {activeTab === "membership-intent" && <MembershipSubmissionsTab />}
      {activeTab === "proposal-intent" && <ProposalSubmissionsTab />}
    </div>
  );
}
