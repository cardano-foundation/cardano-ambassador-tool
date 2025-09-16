'use client';

import Card, { CardContent } from '@/components/atoms/Card';
import AppLogo from '@/components/atoms/Logo';
import HambugerIcon from '@/components/atoms/HumbugerIcon';
import Title from '@/components/atoms/Title';
import ConnectWallet from '@/components/wallet/ConnectWallet';
import { useApp } from '@/context';
import { useWallet } from '@meshsdk/react';
import Link from 'next/link';
import { useNavigation } from '@/hooks/UseNavigation';

const SideNav = () => {
  const { sections, currentActiveId } = useNavigation(); 
  const { connected } = useWallet();
  const { isNetworkValid } = useApp();

  return (
    <div className="bg-background border-border sticky top-0 hidden h-screen w-80 flex-col border-r lg:flex">
      <div className="flex items-center justify-start p-6">
        <AppLogo />
      </div>

      <div className="space-y-8">
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
                const IconComponent = item.icon || HambugerIcon;
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
          {connected && isNetworkValid ? (
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