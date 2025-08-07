'use client';
import ThemeToggle from '@/components/ThemeToggle';
import Breadcrumb from '@/components/atoms/Breadcrumbs';
import Button from '@/components/atoms/Button';
import NotificationIcon from '@/components/atoms/NotificationIcon';
import UserAvatar from '../atoms/UserAvatar';

export default function TopNavBar() {
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
        <UserAvatar size="size-8" name={'kk'} />
      </div>
    </div>
  );
}
