'use client';

import Card, { CardContent } from '@/components/atoms/Card';
import AppLogo from '@/components/atoms/Logo';
import SettingsIcon from '@/components/atoms/SettingsIcon';
import Title from '@/components/atoms/Title';
import UsersIcon from '@/components/atoms/UsersIcon';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { useApp } from '@/context/AppContext';
import { useWallet } from '@meshsdk/react';
import { NavigationSection } from '@types';
import { GridIcon } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

const defaultNavigationSections: NavigationSection[] = [
  {
    items: [
      { id: 'home', label: 'Home', href: '/', icon: GridIcon },
      { id: 'learn', label: 'Learn', href: '/learn', icon: GridIcon },
      { id: 'about', label: 'About', href: '/about', icon: GridIcon },
      {
        id: 'ambassador',
        label: 'Become an Ambassador',
        href: '/sign-up',
        icon: GridIcon,
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
      icon: UsersIcon,
    },
    {
      id: 'dashboard',
      label: 'Profile',
      href: '/dashboard',
      icon: SettingsIcon,
    },
  ],
};

const adminToolsSection: NavigationSection = {
  title: 'Admin Tools',
  items: [
    {
      id: 'manage-ambassadors',
      label: 'Manage Ambassadors',
      href: '/manage/ambassadors',
      icon: UsersIcon,
    },
    {
      id: 'membership-intent',
      label: 'Membership intent',
      href: '/manage/membership',
      icon: SettingsIcon,
    },
    {
      id: 'proposal-intent',
      label: 'Proposal intent',
      href: '/manage/proposals',
      icon: SettingsIcon,
    },
  ],
};

const SideNav = () => {
  const { user } = useApp();
  const pathname = usePathname();

  const [sections, setSections] = useState(defaultNavigationSections);

  const { connected } = useWallet();

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
  }, [pathname]);

  // Update sections when roles change
  useEffect(() => {
    const isAdmin = !!user?.roles?.includes('admin');
    const updated = [...defaultNavigationSections];

    if (isAdmin) {
      updated.push(adminToolsSection);
    }

    if (user) {
      updated.push(memberToolsSection);
    }

    setSections(updated);
  }, [user?.roles]);

  return (
    <div className="bg-background border-border sticky top-0 hidden h-screen w-80 flex-col border-r lg:flex">
      <div className="flex items-center justify-start p-6">
        <AppLogo />
      </div>

      <div className="space-y-8 py-6">
        {sections.map((section, i) => (
          <div key={i}>
            {section.title && (
              <div className="mb-3 px-6">
                <Title
                  level="3"
                  className="text-neutral text-base leading-normal font-normal tracking-wide"
                >
                  {section.title}
                </Title>
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
          {connected ? (
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
