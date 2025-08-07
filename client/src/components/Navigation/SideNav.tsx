'use client';
import Title from '@/components/atoms/Title';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import AppLogo from '../atoms/Logo';
import SettingsIcon from '../atoms/SettingsIcon';
import UsersIcon from '../atoms/UsersIcon';

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect
      x="2"
      y="2"
      width="5"
      height="5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <rect
      x="9"
      y="2"
      width="5"
      height="5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <rect
      x="2"
      y="9"
      width="5"
      height="5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <rect
      x="9"
      y="9"
      width="5"
      height="5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType<{ className?: string }>;
  active?: boolean;
  onClick?: () => void;
}

interface NavigationSection {
  title?: string;
  items: NavigationItem[];
}

interface SideNavigationProps {
  sections?: NavigationSection[];
  activeItemId?: string;
  className?: string;
  isAdmin?: boolean;
}

const defaultNavigationSections: NavigationSection[] = [
  {
    items: [
      { id: 'home', label: 'Home', href: '/', icon: GridIcon },
      { id: 'learn', label: 'Learn', href: '/learn', icon: GridIcon },
      { id: 'about', label: 'About', href: '/about', icon: GridIcon },
      {
        id: 'ambassador',
        label: 'Become an Ambassador',
        href: '/onboarding/sign-up',
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
      href: '/members/submissions',
      icon: UsersIcon,
    },
    {
      id: 'profile',
      label: 'Profile',
      href: '/members/profile',
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
      href: '/admin/ambassadors',
      icon: UsersIcon,
    },
    {
      id: 'membership-intent',
      label: 'Membership intent',
      href: '/admin/membership',
      icon: SettingsIcon,
    },
    {
      id: 'proposal-intent',
      label: 'Proposal intent',
      href: '/admin/proposals',
      icon: SettingsIcon,
    },
  ],
};

const SideNav: React.FC<SideNavigationProps> = ({
  sections = defaultNavigationSections,
  activeItemId = '',
  className = '',
  isAdmin = true,
}) => {
  const pathname = usePathname();
  const getInitialActiveId = () => {
    const allItems = [
      ...defaultNavigationSections.flatMap(s => s.items),
      ...memberToolsSection.items,
      ...adminToolsSection.items
    ];
    const matchingItem = allItems.find(item => item.href === pathname);
    return matchingItem?.id || activeItemId || '';
  };

  const [currentActiveId, setCurrentActiveId] = useState(getInitialActiveId);

  useEffect(() => {
    const allItems = [
      ...defaultNavigationSections.flatMap(s => s.items),
      ...memberToolsSection.items,
      ...adminToolsSection.items
    ];

    const matchingItem = allItems.find(item => item.href === pathname);
    if (matchingItem) {
      setCurrentActiveId(matchingItem.id);
    }
  }, [pathname]);

  const allSections = [...sections];

  if (isAdmin) {
    allSections.push(adminToolsSection);
  } else {
    allSections.push(memberToolsSection);
  }

  return (
    <div
      className={`bg-background border-border sticky top-0 hidden h-screen w-80 border-r lg:block ${className}`}
    >
      <div className="flex items-center justify-start p-6">
        <AppLogo />
      </div>

      <div className="space-y-8 py-6">
        {allSections.map((section, sectionIndex) => (
          <div key={sectionIndex}>
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
                    prefetch
                    key={item.id}
                    href={item.href}
                    className={`hover:bg-muted group flex w-full items-center space-x-3 rounded-r-lg px-6 py-3 text-left transition-colors duration-200 ${
                      isActive ? 'bg-muted' : ''
                    }`}
                  >
                    <div
                      className={`flex h-5 w-5 flex-shrink-0 items-center justify-center transition-colors duration-200 ${
                        isActive
                          ? 'text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <span
                      className={`flex-1 text-left text-base transition-colors duration-200 ${
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
            {sectionIndex === 0 && (
              <div className="border-border mx-6 mt-6 border-b"></div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SideNav;
