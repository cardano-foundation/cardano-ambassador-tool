import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import UserAvatar from '@/components/atoms/UserAvatar';
import { getCountryFlag } from '@/utils';
import { Ambassador } from '@types';
import Link from 'next/link';

export default function AmbassadorCard({
  ambassador,
  isListView = false,
}: {
  ambassador: Ambassador;
  isListView?: boolean;
}) {
  const ambassadorId =
    ambassador.username || ambassador.name.toLowerCase().replace(/\s+/g, '');

  const displayFlag = getCountryFlag(ambassador.country);

  if (isListView) {
    return (
      <Card clickable className="w-full" data-testid="ambassador-card">
        <CardContent className="flex items-center space-x-3 py-3 sm:space-x-4 sm:py-4">
          <UserAvatar size="size-12" name={ambassador.name} />
          <div className="min-w-0 flex-1">
            <Title
              level="6"
              className="text-card-foreground truncate text-sm font-semibold sm:text-base"
            >
              {ambassador.name}
            </Title>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-xs sm:text-sm">{displayFlag}</span>
              <Paragraph size="sm" className="text-muted-foreground truncate">
                {ambassador.country}
              </Paragraph>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Link href={`/ambassadors/${ambassadorId}`}>
              <Button
                variant={'primary'}
                size="sm"
                className="!h-[38px] text-sm font-medium whitespace-nowrap"
              >
                {'view'}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card clickable className="h-full" data-testid="ambassador-card">
      <CardContent className="flex h-full flex-col items-center justify-between space-y-3 py-4 text-center sm:space-y-4 sm:py-6">
        <UserAvatar size="size-16" name={ambassador.name} />

        <Title
          level="6"
          className="text-card-foreground text-sm font-semibold sm:text-base"
        >
          {ambassador.name}
        </Title>
        <div className="flex items-center justify-center gap-2">
          <span className="text-base sm:text-lg">{displayFlag}</span>
          <Paragraph size="sm" className="text-muted-foreground">
            {ambassador.country}
          </Paragraph>
        </div>
        <Link href={`/ambassadors/${ambassadorId}`}>
          <Button
            variant={'primary'}
            size="sm"
            className="!h-[38px] text-sm font-medium whitespace-nowrap"
          >
            {'view'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
