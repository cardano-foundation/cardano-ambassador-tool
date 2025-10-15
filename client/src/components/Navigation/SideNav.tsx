'use client';

import Card, { CardContent } from '@/components/atoms/Card';
import AppLogo from '@/components/atoms/Logo';
import SettingsIcon from '@/components/atoms/SettingsIcon';
import UsersIcon from '@/components/atoms/UsersIcon';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { useApp } from '@/context';
import { NavigationSection } from '@types';
import {
  BookOpenTextIcon,
  GridIcon,
  HomeIcon,
  InfoIcon,
  SendIcon,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import ProposalIcon from '../atoms/ProposalIcon';
import UserIcon from '../atoms/UserIcon';

const defaultNavigationSections: NavigationSection[] = [
  {
    items: [
      { id: 'home', label: 'Home', href: '/', icon: HomeIcon },
      {
        id: 'proposals',
        label: 'Proposals',
        href: '/proposals',
        icon: ProposalIcon,
      },
      { id: 'about', label: 'About', href: '/about', icon: InfoIcon },
      {
        id: 'ambassador',
        label: 'Become an Ambassador',
        href: '/sign-up',
        icon: BookOpenTextIcon,
      },
    ],
  },
];

const memberToolsSection: NavigationSection = {
  title: 'Member Tools',
  items: [
    {
      id: 'submissions',
      label: 'Submissions',
      href: '/dashboard/submissions',
      icon: SendIcon,
    },
    {
      id: 'dashboard',
      label: 'Profile',
      href: '/dashboard',
      icon: UserIcon,
    },
  ],
};

const adminToolsSection: NavigationSection = {
  title: 'Admin Tools',
  items: [
    {
      id: 'manage-ambassadors',
      label: 'Manage Ambassadors',
      href: '/manage/memberships',
      icon: UsersIcon,
    },
    {
      id: 'membership-intent',
      label: 'Membership intents',
      href: '/manage/memberships-intents',
      icon: SettingsIcon,
    },
    {
      id: 'proposal-intent',
      label: 'Proposal intents',
      href: '/manage/proposal-intents',
      icon: ProposalIcon,
    },
  ],
};

const SideNav = () => {
  const { user, isAdmin, wallet, isNetworkValid, userRoles } = useApp();
  const pathname = usePathname();
  const [fetch, setFetch] = useState(false);
  const [sections, setSections] = useState(defaultNavigationSections);

  // Active link handling
  const [currentActiveId, setCurrentActiveId] = useState('');
  useEffect(() => {
    const allItems = [
      ...defaultNavigationSections.flatMap((s) => s.items),
      ...memberToolsSection.items,
      ...adminToolsSection.items,
    ];
    const match = allItems.find((item) => item.href === pathname);
    if (match) setCurrentActiveId(match.id);
  }, [pathname, wallet.isConnected, userRoles]);

  // Update sections when roles change
  useEffect(() => {
    const updated = [...defaultNavigationSections];

    if (isAdmin) {
      updated.push(adminToolsSection);
    }

    if (user) {
      updated.push(memberToolsSection);
    }

    setSections(updated);
  }, [user, isAdmin, wallet.isConnected, userRoles]);

  return (
    <div className="bg-background border-border sticky top-0 hidden h-screen w-80 flex-col overflow-y-auto border-r lg:flex">
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
              {section.items.map((item) => {
                const IconComponent = item.icon || GridIcon;
                const isActive = item.id === currentActiveId;

                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    prefetch={fetch ? null : false}
                    onMouseEnter={() => setFetch(true)}
                    className={`hover:bg-muted group flex w-full items-center space-x-3 px-6 py-3 transition-colors ${
                      isActive ? 'bg-muted' : ''
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center ${
                        isActive ? 'text-primary' : 'text-muted-foreground'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span
                      className={`flex-1 text-left text-base ${
                        isActive
                          ? 'text-primary font-medium'
                          : 'text-neutral font-medium'
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
              Connected Wallet{' '}
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              Connect Wallet{' '}
            </span>
          )}

          <ConnectWallet />
        </CardContent>
      </Card>
    </div>
  );
};

export default SideNav;
