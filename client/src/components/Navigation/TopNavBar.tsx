'use client';
import Breadcrumb from '@/components/atoms/Breadcrumbs';
import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import CardanoIcon from '@/components/atoms/CardanoIcon';
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
import { useState } from 'react';
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
              <div className="text-primary-base flex-shrink-0">
                <CardanoIcon size={40} color="currentColor" />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="bg-background border-none p-2"
                onClick={toggleMobileMenu}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <HambugerIcon className="h-5 w-5" />
                )}
              </Button>
            </div>
            <div className="flex-shrink-0">
              <Breadcrumb />
            </div>
          </div>
          <div className="hidden justify-between lg:flex">
            <div className="flex-shrink-0">
              <Breadcrumb />
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <ThemeToggle />
                <GlobalRefreshButton className="text-primary-base! mr-4 mb-2" />
              </div>
              {user && (
                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <span className="bg-primary-base rounded-full px-2 py-1 text-xs text-white">
                      Admin
                    </span>
                  )}
                  <UserAvatar
                    size="size-8"
                    name={shortenString(user.address)}
                  />
                </div>
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
  const { sections, currentActiveId } = useNavigation();
  const { connected } = useWallet();
  const { user, isAdmin } = useApp();

  return (
    <div className="bg-background flex h-screen w-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-6">
        <AppLogo />
        <Button
          variant="outline"
          size="sm"
          className="bg-background border-none p-2"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
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
