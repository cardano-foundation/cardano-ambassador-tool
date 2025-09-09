"use client";
import React, { useState } from "react";
import Input from "@/components/atoms/Input";

const SearchIcon = ({ className = "" }: { className?: string }) => (
  <svg
    className={className}
    width="20"
    height="15"
    viewBox="0 0 20 20"
    fill="none"
  >
    <path
      d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const GridIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none">
    <rect
      x="2"
      y="2"
      width="5"
      height="5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <rect
      x="9"
      y="2"
      width="5"
      height="5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <rect
      x="2"
      y="9"
      width="5"
      height="5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
    <rect
      x="9"
      y="9"
      width="5"
      height="5"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.5"
      fill="none"
    />
  </svg>
);

const ListIcon = ({ className = "" }: { className?: string }) => (
  <svg className={className} viewBox="0 0 16 16" fill="none">
    <path
      d="M2 4h12M2 8h12M2 12h12"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

interface AmbassadorSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedRegion: string;
  onRegionChange: (region: string) => void;
  availableRegions: string[];
  onViewChange?: (view: "grid" | "list") => void;
  currentView?: "grid" | "list";
}

export default function AmbassadorSearch({
  searchTerm,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  availableRegions,
  onViewChange,
  currentView = "grid",
}: AmbassadorSearchProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const regionOptions = [
    { value: "all", label: "All Regions" },
    ...availableRegions.map((region) => ({
      value: region,
      label: region,
    })),
  ];

  const handleClearRegion = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRegionChange("all");
  };

  const handleRegionSelect = (value: string) => {
    onRegionChange(value);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-end">
      <div className="flex-1 relative">
        <div className="absolute left-3 top-[34px] z-10 pointer-events-none">
          <SearchIcon className="text-muted-foreground" />
        </div>
        <Input
          placeholder="Search ambassador"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 !bg-neutral-50 dark:!bg-card"
        />
      </div>

      <div className="flex gap-2 sm:gap-3 items-center pb-1.5">
        <div className="relative flex-1 sm:flex-none">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full sm:w-auto px-2.5 py-2.5 bg-neutral-50 dark:bg-card  border border-border rounded-md inline-flex justify-between sm:justify-start items-center gap-2.5 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors min-w-0"
          >
            <div className="flex justify-start items-center gap-1 min-w-0">
              <div className="text-muted-foreground text-sm font-normal font-['Chivo'] leading-3 flex-shrink-0">
                Sort
              </div>
              <div className="text-slate-800 dark:text-slate-200 text-sm font-normal font-['Chivo'] leading-3 truncate">
                {selectedRegion === "all" ? "Region" : selectedRegion}
              </div>
            </div>
            <div className="w-4 h-4 relative overflow-hidden flex items-center justify-center flex-shrink-0">
              {selectedRegion !== "all" ? (
                <button
                  onClick={handleClearRegion}
                  className="text-slate-400 text-sm hover:text-slate-600 transition-colors"
                >
                  ×
                </button>
              ) : (
                <svg
                  className={`h-3 w-3 transition-transform text-muted-foreground ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              )}
            </div>
          </button>
          {isDropdownOpen && (
            <div className="absolute left-0 right-0 sm:left-0 sm:right-auto z-50 mt-1 sm:min-w-[200px] origin-top rounded-md bg-background shadow-lg border border-border">
              <div className="py-1 max-h-60 overflow-y-auto">
                {regionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleRegionSelect(option.value)}
                    className={`flex w-full justify-between items-center px-4 py-3 text-left text-sm transition-colors hover:bg-muted ${
                      selectedRegion === option.value
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground"
                    }`}
                  >
                    <span className="flex-1 truncate mr-2">{option.label}</span>
                    {selectedRegion === option.value && (
                      <svg
                        className="h-4 w-4 flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="px-[2px] py-1 bg-neutral-50 dark:bg-card border border-border rounded-md inline-flex justify-center items-center flex-shrink-0">
          <button
            className={`p-1.5 rounded-md bg-white dark:bg-muted flex justify-center items-center ${
              currentView === "grid"
                ? "bg-white dark:bg-gray-900 shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)]"
                : "hover:bg-white/50 dark:hover:bg-gray-900/50"
            }`}
            onClick={() => onViewChange?.("grid")}
            title="Grid view"
          >
            <GridIcon className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            className={`p-1.5 rounded-md flex justify-center items-center ${
              currentView === "list"
                ? "bg-white dark:bg-gray-900 shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] outline-1 outline-offset-[-1px] outline-gray-100"
                : "hover:bg-white/50 dark:hover:bg-gray-900/50"
            }`}
            onClick={() => onViewChange?.("list")}
            title="List view"
          >
            <ListIcon className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
