'use client';
import Breadcrumb from '@/components/atoms/Breadcrumbs';
import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import HambugerIcon from '@/components/atoms/HumbugerIcon';
import AppLogo from '@/components/atoms/Logo';
import ThemeToggle from '@/components/ThemeToggle';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { useApp } from '@/context/AppContext';
import { useNavigation } from '@/hooks/UseNavigation';
import { shortenString } from '@/utils';
import { useWallet } from '@meshsdk/react';
import { X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import UserAvatar from '../atoms/UserAvatar';
import GlobalRefreshButton from '../GlobalRefreshButton';

export default function TopNavBar() {
  const { user, isAdmin } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      <div className="bg-background w-full">
        <div className="mx-auto w-full p-4 lg:p-6">
          <div className="lg:hidden">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-primary-base shrink-0">
                <AppLogo />
              </div>

              <div className="flex flex-row gap-2">
                <GlobalRefreshButton />
                <Button
                  variant="outline"
                  size="xs"
                  className="bg-background border-none py-0!"
                  onClick={toggleMobileMenu}
                  aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
                  aria-expanded={isMobileMenuOpen}
                  aria-controls="mobile-navigation"
                >
                  {isMobileMenuOpen ? (
                    <X className="size-8" />
                  ) : (
                    <HambugerIcon className="h-6 w-6" />
                  )}
                </Button>
              </div>
            </div>
            <div className="shrink-0">
              <Breadcrumb />
            </div>
          </div>
          <div className="hidden justify-between lg:flex">
            <div className="shrink-0">
              <Breadcrumb />
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <div className="border-border mx-1 h-6 border-l" />
              <GlobalRefreshButton />
              {user && (
                <>
                  <div className="border-border mx-1 h-6 border-l" />
                  <div className="relative">
                    <UserAvatar
                      size="size-8"
                      name={shortenString(user.address)}
                    />
                    {isAdmin && (
                      <span className="bg-primary-base absolute -bottom-1 left-1/2 -translate-x-1/2 transform rounded-full px-2 text-[10px] font-medium whitespace-nowrap text-white shadow-md">
                        Admin
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 z-40 lg:hidden"
            onClick={toggleMobileMenu}
          />
          <div className="fixed inset-0 z-50 lg:hidden">
            <MobileSideNav onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </>
      )}
    </>
  );
}

function MobileSideNav({ onClose }: { onClose: () => void }) {
  const {
    currentActiveId,
    defaultNavigationSections,
    memberToolsSection,
    adminToolsSection,
  } = useNavigation();
  const { connected } = useWallet();
  const { user, isAdmin, userRoles } = useApp();

  const [sections, setSections] = useState(defaultNavigationSections);
  useEffect(() => {
    const updated = [...defaultNavigationSections];

    if (isAdmin) {
      updated.push(adminToolsSection);
    }

    if (user) {
      updated.push(memberToolsSection);
    }

    setSections(updated);
  }, [user, isAdmin, userRoles]);

  return (
    <div className="bg-background flex h-screen w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 lg:p-6">
        <AppLogo />
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <div className="border-border mx-1 h-6 border-l" />
          {user && (
            <>
              <div className="relative">
                <UserAvatar size="size-8" name={shortenString(user.address)} />
                {isAdmin && (
                  <span className="bg-primary-base absolute -bottom-1 left-1/2 -translate-x-1/2 transform rounded-full px-2 text-[10px] font-medium whitespace-nowrap text-white shadow-md">
                    Admin
                  </span>
                )}
              </div>
            </>
          )}
          <div className="border-border mx-1 h-6 border-l" />
          <Button
            variant="outline"
            size="sm"
            className="bg-background border-none p-2"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Navigation sections */}
      <div className="flex-1 space-y-8 overflow-y-auto">
        {sections.map((section, i) => (
          <div key={i}>
            <nav className="space-y-1">
              {section.items.map((item) => {
                const IconComponent = item.icon || HambugerIcon;
                const isActive = item.id === currentActiveId;
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    className={`hover:bg-muted group flex w-full items-center space-x-3 px-6 py-3 transition-colors ${
                      isActive ? 'bg-muted' : ''
                    }`}
                    onClick={onClose}
                  >
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center ${
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
              Connected Wallet
            </span>
          ) : (
            <span className="text-muted-foreground text-sm">
              Connect Wallet
            </span>
          )}
          <ConnectWallet />
        </CardContent>
      </Card>
    </div>
  );
}
