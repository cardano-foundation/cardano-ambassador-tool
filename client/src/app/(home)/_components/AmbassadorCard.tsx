import Button from '@/components/atoms/Button';
import Card, { CardContent } from '@/components/atoms/Card';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import UserAvatar from '@/components/atoms/UserAvatar';
import { Ambassador } from '@/data/mockAmbassadors';

export default function AmbassadorCard({
  ambassador,
  isListView = false,
}: {
  ambassador: Ambassador;
  isListView?: boolean;
}) {

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      Argentina: '🇦🇷',
      Romania: '🇷🇴',
      Indonesia: '🇮🇩',
      Norway: '🇳🇴',
      Ghana: '🇬🇭',
      Germany: '🇩🇪',
      DRC: '🇨🇩',
      Scotland: '🏴󠁧󠁢󠁳󠁣󠁴󠁿',
      'United States': '🇺🇸',
      Kazakhstan: '🇰🇿',
      Poland: '🇵🇱',
      Venezuela: '🇻🇪',
      Netherlands: '🇳🇱',
      Italy: '🇮🇹',
      Brazil: '🇧🇷',
      UAE: '🇦🇪',
      Singapore: '🇸🇬',
      France: '🇫🇷',
      Japan: '🇯🇵',
      Ireland: '🇮🇪',
      Spain: '🇪🇸',
      Nigeria: '🇳🇬',
      'United Kingdom': '🇬🇧',
      India: '🇮🇳',
      Sweden: '🇸🇪',
      'Czech Republic': '🇨🇿',
      Mexico: '🇲🇽',
      Russia: '🇷🇺',
      Canada: '🇨🇦',
      Morocco: '🇲🇦',
      'South Korea': '🇰🇷',
      Ukraine: '🇺🇦',
      Austria: '🇦🇹',
      Slovakia: '🇸🇰',
      China: '🇨🇳',
      Colombia: '🇨🇴',
      Egypt: '🇪🇬',
      'New Zealand': '🇳🇿',
      Tunisia: '🇹🇳',
      Australia: '🇦🇺',
    };
    return flags[country] || '🌍';
  };

  if (isListView) {
    return (
      <Card clickable className="w-full">
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
              <span className="text-xs sm:text-sm">
                {getCountryFlag(ambassador.country)}
              </span>
              <Paragraph size="sm" className="text-muted-foreground truncate">
                {ambassador.country}
              </Paragraph>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Button
              variant={ambassador.isFollowing ? 'outline' : 'primary'}
              size="sm"
              className="!h-[38px] text-sm font-medium whitespace-nowrap"
            >
              {ambassador.isFollowing ? 'Following' : 'Follow'}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card clickable className="h-full">
      <CardContent className="flex h-full flex-col items-center justify-between space-y-3 py-4 text-center sm:space-y-4 sm:py-6">
        <UserAvatar size="size-16" name={ambassador.name} />

        <Title
          level="6"
          className="text-card-foreground text-sm font-semibold sm:text-base"
        >
          {ambassador.name}
        </Title>
        <div className="flex items-center justify-center gap-2">
          <span className="text-base sm:text-lg">
            {getCountryFlag(ambassador.country)}
          </span>
          <Paragraph size="sm" className="text-muted-foreground">
            {ambassador.country}
          </Paragraph>
        </div>
        <Button
          variant={ambassador.isFollowing ? 'outline' : 'primary'}
          size="sm"
          fullWidth
          className={`${ambassador.isFollowing ? 'text-primary-base!' : ''} text-xs sm:text-sm`}
        >
          {ambassador.isFollowing ? 'Following' : 'Follow'}
        </Button>
      </CardContent>
    </Card>
  );
}
