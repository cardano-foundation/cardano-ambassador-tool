"use client";
import React, { useState, useMemo } from "react";
import Card, { CardContent } from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Paragraph from "@/components/atoms/Paragraph";
import Title from "@/components/atoms/Title";
import AmbassadorSearchBar from "@/components/AmbassadorSearchBar";
import { mockAmbassadors, Ambassador } from "@/data/mockAmbassadors";

function AmbassadorCard({
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

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("all");
  const [currentView, setCurrentView] = useState<"grid" | "list">("grid");
  const [displayCount, setDisplayCount] = useState(20);

  const uniqueCountries = [
    ...new Set(mockAmbassadors.map((a) => a.country)),
  ].sort();

  const filteredAmbassadors = useMemo(() => {
    return mockAmbassadors.filter((ambassador) => {
      const matchesSearch =
        ambassador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ambassador.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion =
        selectedRegion === "all" || ambassador.country === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion]);

  const displayedAmbassadors = filteredAmbassadors.slice(0, displayCount);
  const hasMoreAmbassadors = displayCount < filteredAmbassadors.length;

  React.useEffect(() => {
    setDisplayCount(20);
  }, [searchTerm, selectedRegion]);

  const handleShowMore = () => {
    setDisplayCount((prevCount) => prevCount + 12);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 py-6 sm:py-12">
      <div className="space-y-3 sm:space-y-4">
        <Title
          level="2"
          className="text-zinc-800 dark:text-black-500 text-xl sm:text-2xl"
        >
          Welcome to Cardano Ambassador Explorer
        </Title>
        <Paragraph
          size="base"
          className="text-muted-foreground max-w-4xl text-sm sm:text-base"
        >
          Discover the passionate individuals shaping the Cardano ecosystem.
          From developers and educators to community organizers, these
          ambassadors are driving innovation, connection, and real-world impact.
          Explore their profiles, get inspired, and see how you can be part of
          this global movement.
        </Paragraph>
      </div>

      <AmbassadorSearchBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        selectedRegion={selectedRegion}
        onRegionChange={setSelectedRegion}
        availableRegions={uniqueCountries}
        currentView={currentView}
        onViewChange={setCurrentView}
      />

      <div className="flex items-center justify-between">
        <Paragraph size="sm" className="text-muted-foreground">
          Showing {displayedAmbassadors.length} of {filteredAmbassadors.length}{" "}
          Users
        </Paragraph>
      </div>

      <div
        className={
          currentView === "grid"
            ? "grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-6"
            : "space-y-3 sm:space-y-4"
        }
      >
        {displayedAmbassadors.map((ambassador) => (
          <AmbassadorCard
            key={ambassador.id}
            ambassador={ambassador}
            isListView={currentView === "list"}
          />
        ))}
      </div>

      {hasMoreAmbassadors && (
        <div className="flex justify-center pt-6 sm:pt-8">
          <button
            className="text-sm font-medium underline decoration-dotted decoration-primary-400 underline-offset-4 bg-transparent border-none p-0 cursor-pointer"
            onClick={handleShowMore}
          >
            <Paragraph
              size="base"
              className="text-xs font-medium text-primary-400"
            >
              Show more Ambassadors
            </Paragraph>
          </button>
        </div>
      )}

      {filteredAmbassadors.length === 0 && (
        <div className="text-center py-12">
          <Paragraph size="base" className="text-muted-foreground">
            No ambassadors found matching your criteria.
          </Paragraph>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearchTerm("");
              setSelectedRegion("all");
            }}
            className="mt-2 text-primary-base hover:text-primary-400"
          >
            Clear filters
          </Button>
        </div>
      )}
    </div>
  );
}
