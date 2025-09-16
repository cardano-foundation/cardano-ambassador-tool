'use client';
import AmbassadorSearchBar from '@/components/AmbassadorSearchBar';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import { Pagination } from '@/components/Pagination'; // Import your Pagination component
import { useApp } from '@/context';
import React, { useMemo, useState } from 'react';
import AmbassadorCard from './_components/AmbassadorCard';

export default function HomePage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [currentView, setCurrentView] = useState<'grid' | 'list'>('grid');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { ambassadors } = useApp();

  const uniqueCountries = [
    ...new Set(ambassadors.map((a) => a.country)),
  ].sort();

  const filteredAmbassadors = useMemo(() => {
    return ambassadors.filter((ambassador) => {
      const matchesSearch =
        ambassador.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ambassador.country.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRegion =
        selectedRegion === 'all' || ambassador.country === selectedRegion;
      return matchesSearch && matchesRegion;
    });
  }, [searchTerm, selectedRegion, ambassadors]);

  // Calculate pagination values
  const totalItems = filteredAmbassadors.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const displayedAmbassadors = filteredAmbassadors.slice(startIndex, endIndex);

  // Reset to page 1 when search or filter changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedRegion]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Optional: Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset to first page when page size changes
  };

  return (
    <div className="space-y-4 p-3 py-2 sm:space-y-6 sm:p-6">
      <div className="space-y-3 sm:space-y-4">
        <Title level="2" className="text-xl sm:text-2xl">
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
          Showing {startIndex + 1}-{endIndex} of {totalItems} Users
        </Paragraph>
      </div>

      <div
        className={
          currentView === 'grid'
            ? 'grid grid-cols-1 gap-3 sm:grid-cols-1 sm:gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
            : 'space-y-3 sm:space-y-4'
        }
      >
        {displayedAmbassadors.map((ambassador) => (
          <AmbassadorCard
            key={ambassador.name}
            ambassador={ambassador}
            isListView={currentView === 'list'}
          />
        ))}
      </div>

      {/* Show pagination only if there are items */}
      {totalItems > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          pageSize={pageSize}
          totalItems={totalItems}
          itemsPerPageStart={startIndex + 1}
          itemsPerPageEnd={endIndex}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={[10, 20, 50, 100]}
          showPageSizeSelector={true}
          maxVisiblePages={5}
        />
      )}

      {/* Show message when no results found */}
      {totalItems === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Paragraph size="base" className="text-muted-foreground">
            No ambassadors found matching your search criteria.
          </Paragraph>
          {(searchTerm || selectedRegion !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedRegion('all');
              }}
              className="mt-4 text-primary underline"
            >
              Clear filters
            </button>
          )}
        </div>
      )}
    </div>
  );
}