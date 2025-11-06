import { Tabs, TabsList, TabsTrigger } from '@/components/Tabs';
import { cn } from '@/utils/utils';
import React from 'react';

interface TabItem {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
  onClick?: () => void;
}

interface TopNavigationTabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string, tab: TabItem) => void; 
  className?: string;
}

const TopNav: React.FC<TopNavigationTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  className = '',
}) => {
  const handleTabClick = (tab: TabItem) => {
    if (tab.disabled) return;

    onTabChange(tab.id, tab);
    tab.onClick?.();
  };

  return (
    <div className="w-full">
      <Tabs className={cn('w-full', className)} value={activeTabId}>
        <TabsList className="w-full grid" style={{ gridTemplateColumns: `repeat(${tabs.length}, 1fr)` }}>
          {tabs.map((tab) => {
            return (
              <TabsTrigger
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                disabled={tab.disabled}
                value={tab.id}
                className="w-full flex justify-center"
                aria-label={tab.label}
                aria-selected={activeTabId === tab.id}
                role="tab"
              >
                <div
                  className={cn(
                    'text-sm leading-none whitespace-nowrap transition-all duration-200 hover:cursor-pointer',
                    activeTabId === tab.id
                      ? 'text-primary-base font-bold'
                      : 'font-normal text-neutral-500 hover:text-neutral-700',
                  )}
                >
                  {tab.label}
                </div>
              </TabsTrigger>
            );
          })}
        </TabsList>
      </Tabs>
    </div>
  );
};

export default TopNav;