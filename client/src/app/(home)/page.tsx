"use client";
import React, { useState, useMemo } from "react";
import Paragraph from "@/components/atoms/Paragraph";
import Title from "@/components/atoms/Title";
import AmbassadorSearchBar from "@/components/AmbassadorSearchBar";
import { mockAmbassadors } from "@/data/mockAmbassadors";
import AmbassadorCard from "./components/am/AmbassadorCard";


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
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 py-2">
      <div className="space-y-3 sm:space-y-4">
        <Title
          level="2"
          className=" text-xl sm:text-2xl"
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
        <Paragraph size="sm" className="text-neutral">
          Showing {displayedAmbassadors.length} Users
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
              className="text-base font-medium text-primary-400"
            >
              Show more Ambassadors
            </Paragraph>
          </button>
        </div>
      )}
    </div>
  );
}
