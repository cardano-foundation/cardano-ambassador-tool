'use client';
import ThemeToggle from '@/components/ThemeToggle';
import Breadcrumb from '@/components/atoms/Breadcrumbs';
import Button from '@/components/atoms/Button';
import NotificationIcon from '@/components/atoms/NotificationIcon';
import { useApp } from '@/context/AppContext';
import { shortenString } from '@/utils';
import UserAvatar from '../atoms/UserAvatar';

export default function TopNavBar() {
  const { user, isAdmin } = useApp();

  return (
    <div className="bg-background flex items-center justify-between px-3 py-4 sm:px-6 sm:py-6">
      <div className="flex-shrink-0">
        <Breadcrumb />
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          className="bg-background border-none p-2"
        >
          <NotificationIcon />
        </Button>
        {user && (
          <div className="flex items-center gap-2">
            {isAdmin && (
              <span className="bg-primary-base rounded-full px-2 py-1 text-xs text-white">
                Admin
              </span>
            )}
            <UserAvatar size="size-8" name={shortenString(user.address)} />
          </div>
        )}
      </div>
    </div>
  );
}
