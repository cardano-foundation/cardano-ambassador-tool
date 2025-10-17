// hooks/useNavigation.ts
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useWallet } from '@meshsdk/react';
import { routes } from '@/config/routes';
import { useApp } from '@/context/AppContext';
import { NavigationSection } from '@types';
import { BookOpenTextIcon, GridIcon, HomeIcon, SendIcon, UserIcon } from 'lucide-react';
import UsersIcon from '@/components/atoms/UsersIcon';
import SettingsIcon from '@/components/atoms/SettingsIcon';
import ProposalIcon from '@/components/atoms/ProposalIcon';

const defaultNavigationSections: NavigationSection[] = [
  {
    items: [
      { id: 'home', label: 'Home', href: routes.home, icon: HomeIcon },
      { id: 'proposals', label: 'Proposals', href: routes.proposals, icon: ProposalIcon },
      { id: 'about', label: 'About', href: routes.about, icon: GridIcon },
      {
        id: 'ambassador',
        label: 'Become an Ambassador',
        href: routes.signUp,
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
      href: routes.my.submissions,
      icon: SendIcon,
    },
    {
      id: 'dashboard',
      label: 'Profile',
      href: routes.my.profile,
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
      href: routes.manage.ambassadors,
      icon: UsersIcon,
    },
    {
      id: 'membership-intent',
      label: 'Membership intents',
      href: routes.manage.membershipIntents,
      icon: SettingsIcon,
    },
    {
      id: 'proposal-intent',
      label: 'Proposal intents',
      href: routes.manage.proposalIntents,
      icon: ProposalIcon,
    },
  ],
};

export const useNavigation = () => {
  const { user, isAdmin } = useApp();
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