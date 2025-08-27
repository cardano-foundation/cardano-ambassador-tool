'use client';
import ThemeToggle from '@/components/ThemeToggle';
import Breadcrumb from '@/components/atoms/Breadcrumbs';
import Button from '@/components/atoms/Button';
import NotificationIcon from '@/components/atoms/NotificationIcon';
import { useUser } from '@/context/AppContext';
import InboxIcon from '../atoms/InboxIcon';
import LinkButton from '../atoms/LinkButton';
import UserAvatar from '../atoms/UserAvatar';

export default function TopNavBar() {
  const { user } = useUser();

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
        {user ? (
          <UserAvatar size="size-8" name={'kk'} />
        ) : (
          <LinkButton
            href="/login"
            variant="outline"
            size="md"
            rounded="full"
            className="flex w-full gap-2 px-2! py-2! lg:gap-4"
          >
            <span className="text-primary-base font-bold">Sign In</span>
            <InboxIcon />
          </LinkButton>
        )}
      </div>
    </div>
  );
}
