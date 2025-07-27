import Button from "@/components/atoms/Button";
import Card, { CardContent } from "@/components/atoms/Card";
import Paragraph from "@/components/atoms/Paragraph";
import Title from "@/components/atoms/Title";
import { Ambassador } from "@/data/mockAmbassadors";

export default function AmbassadorCard({
  ambassador,
  isListView = false,
}: {
  ambassador: Ambassador;
  isListView?: boolean;
}) {
  const getAvatarFallback = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const getCountryFlag = (country: string) => {
    const flags: { [key: string]: string } = {
      Argentina: "🇦🇷",
      Romania: "🇷🇴",
      Indonesia: "🇮🇩",
      Norway: "🇳🇴",
      Ghana: "🇬🇭",
      Germany: "🇩🇪",
      DRC: "🇨🇩",
      Scotland: "🏴󠁧󠁢󠁳󠁣󠁴󠁿",
      "United States": "🇺🇸",
      Kazakhstan: "🇰🇿",
      Poland: "🇵🇱",
      Venezuela: "🇻🇪",
      Netherlands: "🇳🇱",
      Italy: "🇮🇹",
      Brazil: "🇧🇷",
      UAE: "🇦🇪",
      Singapore: "🇸🇬",
      France: "🇫🇷",
      Japan: "🇯🇵",
      Ireland: "🇮🇪",
      Spain: "🇪🇸",
      Nigeria: "🇳🇬",
      "United Kingdom": "🇬🇧",
      India: "🇮🇳",
      Sweden: "🇸🇪",
      "Czech Republic": "🇨🇿",
      Mexico: "🇲🇽",
      Russia: "🇷🇺",
      Canada: "🇨🇦",
      Morocco: "🇲🇦",
      "South Korea": "🇰🇷",
      Ukraine: "🇺🇦",
      Austria: "🇦🇹",
      Slovakia: "🇸🇰",
      China: "🇨🇳",
      Colombia: "🇨🇴",
      Egypt: "🇪🇬",
      "New Zealand": "🇳🇿",
      Tunisia: "🇹🇳",
      Australia: "🇦🇺",
    };
    return flags[country] || "🌍";
  };

  if (isListView) {
    return (
      <Card clickable className="w-full">
        <CardContent className="flex items-center space-x-3 sm:space-x-4 py-3 sm:py-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
              <span className="text-white font-semibold text-xs sm:text-sm">
                {getAvatarFallback(ambassador.name)}
              </span>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <Title
              level="6"
              className="text-card-foreground text-sm sm:text-base font-semibold truncate"
            >
              {ambassador.name}
            </Title>
            <div className="flex items-center gap-2 mt-1">
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
              variant={ambassador.isFollowing ? "secondary" : "primary"}
              size="sm"
              className="text-sm font-medium whitespace-nowrap !h-[38px]"
            >
              {ambassador.isFollowing ? "Following" : "Follow"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card clickable className="h-full">
      <CardContent className="text-center space-y-3 sm:space-y-4 py-4 sm:py-6">
        <div className="flex justify-center">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
            <span className="text-white font-semibold text-sm sm:text-lg">
              {getAvatarFallback(ambassador.name)}
            </span>
          </div>
        </div>
        <Title
          level="6"
          className="text-card-foreground text-sm sm:text-base font-semibold"
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
          variant={ambassador.isFollowing ? "secondary" : "primary"}
          size="sm"
          fullWidth
          className="text-xs sm:text-sm"
        >
          {ambassador.isFollowing ? "Following" : "Follow"}
        </Button>
      </CardContent>
    </Card>
  );
}
