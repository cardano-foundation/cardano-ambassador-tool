// hooks/useNavigation.ts
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useWallet } from '@meshsdk/react';
import { useApp } from '@/context';
import { useUserAuth } from '@/hooks/useUserAuth';
import { NavigationSection } from '@types';
import { GridIcon } from 'lucide-react';
import UsersIcon from '@/components/atoms/UsersIcon';
import SettingsIcon from '@/components/atoms/SettingsIcon';

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

export const useNavigation = () => {
  const { user, isAdmin } = useUserAuth();
  const pathname = usePathname();
  const { connected } = useWallet();
  const { isNetworkValid } = useApp();
  
  const [sections, setSections] = useState(defaultNavigationSections);
  const [currentActiveId, setCurrentActiveId] = useState('');

  // Active link handling
  useEffect(() => {
    const allItems = [
      ...defaultNavigationSections.flatMap((s) => s.items),
      ...memberToolsSection.items,
      ...adminToolsSection.items,
    ];
    const match = allItems.find((item) => item.href === pathname);
    if (match) setCurrentActiveId(match.id);
  }, [pathname, connected]);

  // Update sections when roles change
  useEffect(() => {
    const updated = [...defaultNavigationSections];

    if (!isNetworkValid) {
      setSections(updated);
      return;
    }

    if (isAdmin) {
      updated.push(adminToolsSection);
    }

    if (user) {
      updated.push(memberToolsSection);
    }

    setSections(updated);
  }, [user, isAdmin, connected, isNetworkValid]);

  return {
    sections,
    currentActiveId,
    defaultNavigationSections,
    memberToolsSection,
    adminToolsSection,
  };
};