import Card, { CardContent } from '@/components/atoms/Card';
import CardanoIcon from '@/components/atoms/CardanoIcon';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import UserAvatar from '@/components/atoms/UserAvatar';
import { getCountryFlag } from '@/utils';
import { StatCard } from '../../(home)/_components/profile/StartCard';

interface ProfileHeaderProps {
  name: string;
  country: string;
  stats: {
    topics_created: number;
    likes_given: number;
    likes_received: number;
    days_visited: number;
  } | null;
}

export default function ProfileHeader({ name, country, stats }: ProfileHeaderProps) {
  return (
    <Card className="mb-8">
      <CardContent>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="mb-2 flex items-start gap-4">
            <div className="relative flex-shrink-0">
              <UserAvatar size="size-30" name={name} />
              <div className="absolute right-0.5 bottom-0.5 z-10 flex h-8 w-8 items-center justify-center rounded-full border border-white bg-white">
                <div className="text-primary-base">
                  <CardanoIcon size={20} color="currentColor" />
                </div>
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <Title level="5" className="text-neutral">
                {name}
              </Title>
              <Paragraph className="text-muted-foreground text-sm">
                Ambassador
              </Paragraph>
              <div className="mt-1 flex items-center space-x-2">
                <span className="rounded-full text-base">
                  {getCountryFlag(country)}
                </span>
                <span className="text-muted-foreground text-sm">
                  {country}
                </span>
              </div>
            </div>
          </div>
          
          {stats && (
            <div className="grid grid-cols-2 gap-3 lg:flex lg:gap-2">
              <StatCard
                label="Topics Created"
                value={stats.topics_created}
              />
              <StatCard
                label="Given"
                value={stats.likes_given}
                showHeart
              />
              <StatCard
                label="Received"
                value={stats.likes_received}
                showHeart
              />
              <StatCard
                label="Days Visited"
                value={stats.days_visited}
              />
              <StatCard
                label="Posts Created"
                value={stats.topics_created}
              />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}