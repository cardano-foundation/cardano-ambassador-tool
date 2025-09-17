'use client';
import Input from '@/components/atoms/Input';
import React, { useState } from 'react';

const SearchIcon = ({ className = '' }: { className?: string }) => (
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

const GridIcon = ({ className = '' }: { className?: string }) => (
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

const ListIcon = ({ className = '' }: { className?: string }) => (
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
  onViewChange?: (view: 'grid' | 'list') => void;
  currentView?: 'grid' | 'list';
}

export default function AmbassadorSearch({
  searchTerm,
  onSearchChange,
  selectedRegion,
  onRegionChange,
  availableRegions,
  onViewChange,
  currentView = 'grid',
}: AmbassadorSearchProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const regionOptions = [
    { value: 'all', label: 'All Regions' },
    ...availableRegions.map((region) => ({
      value: region,
      label: region,
    })),
  ];

  const handleClearRegion = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRegionChange('all');
  };

  const handleRegionSelect = (value: string) => {
    onRegionChange(value);
    setIsDropdownOpen(false);
  };

  return (
    <div className="flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:gap-4">
      <div className="relative flex-1">
        <div className="pointer-events-none absolute top-[34px] left-3 z-10">
          <SearchIcon className="text-muted-foreground" />
        </div>
        <Input
          placeholder="Search ambassador"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="dark:!bg-card !bg-neutral-50 pl-10"
        />
      </div>

      <div className="flex items-center gap-2 pb-1.5 sm:gap-3">
        <div className="relative flex-1 sm:flex-none">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="dark:bg-card border-border inline-flex w-full min-w-0 items-center justify-between gap-2.5 rounded-md border bg-neutral-50 px-2.5 py-2.5 transition-colors hover:bg-gray-200 sm:w-auto sm:justify-start dark:hover:bg-gray-700"
          >
            <div className="flex min-w-0 items-center justify-start gap-1">
              <div className="text-muted-foreground flex-shrink-0 font-['Chivo'] text-sm leading-3 font-normal">
                Sort
              </div>
              <div className="truncate font-['Chivo'] text-sm leading-3 font-normal text-slate-800 dark:text-slate-200">
                {selectedRegion === 'all' ? 'Region' : selectedRegion}
              </div>
            </div>
            <div className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center overflow-hidden">
              {selectedRegion !== 'all' ? (
                <button
                  onClick={handleClearRegion}
                  className="text-sm text-slate-400 transition-colors hover:text-slate-600"
                >
                  ×
                </button>
              ) : (
                <svg
                  className={`text-muted-foreground h-3 w-3 transition-transform ${
                    isDropdownOpen ? 'rotate-180' : ''
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
            <div className="bg-background border-border absolute right-0 left-0 z-50 mt-1 origin-top rounded-md border shadow-lg sm:right-auto sm:left-0 sm:min-w-[200px]">
              <div className="max-h-60 overflow-y-auto py-1">
                {regionOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => handleRegionSelect(option.value)}
                    className={`hover:bg-muted flex w-full items-center justify-between px-4 py-3 text-left text-sm transition-colors ${
                      selectedRegion === option.value
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <span className="mr-2 flex-1 truncate">{option.label}</span>
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
        <div className="dark:bg-card border-border inline-flex flex-shrink-0 items-center justify-center rounded-md border bg-neutral-50 px-[2px] py-1">
          <button
            className={`dark:bg-muted flex items-center justify-center rounded-md bg-white p-1.5 ${
              currentView === 'grid'
                ? 'bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] dark:bg-gray-900'
                : 'hover:bg-white/50 dark:hover:bg-gray-900/50'
            }`}
            onClick={() => onViewChange?.('grid')}
            title="Grid view"
          >
            <GridIcon className="text-muted-foreground h-4 w-4" />
          </button>
          <button
            className={`flex items-center justify-center rounded-md p-1.5 ${
              currentView === 'list'
                ? 'bg-white shadow-[0px_3px_4px_0px_rgba(0,0,0,0.03)] outline-1 outline-offset-[-1px] outline-gray-100 dark:bg-gray-900'
                : 'hover:bg-white/50 dark:hover:bg-gray-900/50'
            }`}
            onClick={() => onViewChange?.('list')}
            title="List view"
          >
            <ListIcon className="text-muted-foreground h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
