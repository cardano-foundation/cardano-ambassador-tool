"use client";

import Card, { CardContent } from "@/components/atoms/Card";
import AppLogo from "@/components/atoms/Logo";
import SettingsIcon from "@/components/atoms/SettingsIcon";
import UsersIcon from "@/components/atoms/UsersIcon";
import ConnectWallet from "@/components/wallet/ConnectWallet";
import { routes } from "@/config/routes";
import { useNetworkValidation, useUserAuth, useWalletManager } from "@/hooks";
import { NavigationSection } from "@types";
import {
  BookOpenTextIcon,
  GridIcon,
  HomeIcon,
  InfoIcon,
  SendIcon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import ProposalIcon from "../atoms/ProposalIcon";
import UserIcon from "../atoms/UserIcon";

const defaultNavigationSections: NavigationSection[] = [
  {
    items: [
      { id: "home", label: "Home", href: routes.home, icon: HomeIcon },
      {
        id: "proposals",
        label: "Proposals",
        href: routes.proposals,
        icon: ProposalIcon,
      },
      {
        id: "user-guide",
        label: "User Guide",
        href: routes.userGuide,
        icon: InfoIcon,
      },
      {
        id: "ambassador",
        label: "Become an Ambassador",
        href: routes.signUp,
        icon: BookOpenTextIcon,
      },
    ],
  },
];

const memberToolsSection: NavigationSection = {
  title: "Member Tools",
  items: [
    {
      id: "submissions",
      label: "Submissions",
      href: routes.my.submissions,
      icon: SendIcon,
    },
    {
      id: "dashboard",
      label: "Profile",
      href: routes.my.profile,
      icon: UserIcon,
    },
  ],
};

const adminToolsSection: NavigationSection = {
  title: "Admin Tools",
  items: [
    {
      id: "manage-ambassadors",
      label: "Manage Ambassadors",
      href: routes.manage.ambassadors,
      icon: UsersIcon,
    },
    {
      id: "membership-intent",
      label: "Membership Applications",
      href: routes.manage.membershipApplications,
      icon: SettingsIcon,
    },
    {
      id: "proposal-intent",
      label: "Proposal Applications",
      href: routes.manage.proposalApplications,
      icon: ProposalIcon,
    },
    {
      id: "treasury-signoffs",
      label: "Treasury Sign offs",
      href: routes.manage.treasurySignoffs,
      icon: ProposalIcon,
    },
    {
      id: "admin-guide",
      label: "Admin Guide",
      href: routes.manage.adminGuide,
      icon: InfoIcon,
    },
  ],
};

const SideNav = () => {
  const wallet = useWalletManager();
  const { user, isAdmin, userRoles, isAuthenticated } = useUserAuth({
    wallet: wallet.wallet,
    address: wallet.address,
    isConnected: wallet.isConnected,
  });
  const { isNetworkValid } = useNetworkValidation({
    wallet: wallet.wallet,
    isConnected: wallet.isConnected,
  });
  const pathname = usePathname();
  const [sections, setSections] = useState(defaultNavigationSections);

  // Active link handling
  const [currentActiveId, setCurrentActiveId] = useState("");
  useEffect(() => {
    const allItems = [
      ...defaultNavigationSections.flatMap((s) => s.items),
      ...memberToolsSection.items,
      ...adminToolsSection.items,
    ];
    const match = allItems.find((item) => item.href === pathname);
    if (match) setCurrentActiveId(match.id);
  }, [pathname]);

  // Update sections when roles change
  useEffect(() => {
    const updated = [...defaultNavigationSections];

    if (isAdmin) {
      updated.push(adminToolsSection);
    }

    if (isAuthenticated) {
      updated.push(memberToolsSection);
    }

    setSections(updated);
  }, [isAuthenticated, isAdmin]);

  return (
    <div className="bg-background border-border sticky top-0 hidden h-screen w-80 flex-col overflow-y-auto border-r scrollbar-hide lg:flex">
      <div className="flex items-center justify-start p-6">
        <Link href="/">
          <AppLogo />
        </Link>
      </div>

      <div className="space-y-8">
        {sections.map((section, i) => (
          <div key={i}>
            {section.title && (
              <div className="mb-3 px-6">
                <span className="text-neutral text-base leading-normal font-normal tracking-wide">
                  {section.title}
                </span>
              </div>
            )}
            <nav className="space-y-1">
              {section.items
                .filter((item) => item.href) // Skip items without href
                .map((item) => {
                  const IconComponent = item.icon || GridIcon;
                  const isActive = item.id === currentActiveId;

                  if (!item.href) {
                    return null;
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.href}
                      className={`hover:bg-muted group flex w-full items-center space-x-3 px-6 py-3 transition-colors ${
                        isActive ? "bg-muted" : ""
                      }`}
                      aria-label={item.label}
                      aria-current={isActive ? "page" : undefined}
                    >
                      <div
                        className={`flex h-5 w-5 flex-shrink-0 items-center justify-center ${
                          isActive ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        <IconComponent className="h-5 w-5" />
                      </div>
                      <span
                        className={`text-sm font-medium ${
                          isActive ? "text-foreground" : "text-muted-foreground"
                        }`}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
            </nav>
            {i === 0 && <div className="border-border mx-6 mt-6 border-b" />}
          </div>
        ))}
      </div>

      <Card padding="sm" className="mx-4 mt-auto mb-4">
        <CardContent className="flex flex-col">
          {wallet.isConnected && isNetworkValid ? (
            <span className="text-muted-foreground text-sm">
              Connected Wallet{" "}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              Connect Wallet{" "}
            </span>
          )}

          <ConnectWallet />
        </CardContent>
      </Card>
    </div>
  );
};

export default SideNav;
