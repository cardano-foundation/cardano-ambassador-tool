import React, { useState } from "react";
import { cn } from "@/utils/utils";
import { Tabs, TabsList, TabsTrigger } from "@/components/Tabs";

interface TabItem {
  id: string;
  label: string;
  count?: number;
  disabled?: boolean;
  onClick?: () => void;
}

interface TopNavigationTabsProps {
  tabs: TabItem[];
  activeTabId?: string;
  onTabChange?: (tabId: string, tab: TabItem) => void;
  className?: string;
}

const TopNav: React.FC<TopNavigationTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  className = "",
}) => {
  const [currentActiveId, setCurrentActiveId] = useState(
    activeTabId || tabs[0]?.id
  );

  const handleTabClick = (tab: TabItem) => {
    if (tab.disabled) return;

    setCurrentActiveId(tab.id);
    onTabChange?.(tab.id, tab);
    tab.onClick?.();
  };

  return (
    <div className="w-full overflow-hidden"> {/* Add container with overflow hidden */}
      <Tabs
        className={cn(
          "w-full min-w-0",
          className
        )}
      >
        <TabsList className="overflow-x-auto scroll-smooth whitespace-nowrap w-full min-w-0 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = currentActiveId === tab.id;
            return (
              <TabsTrigger
                key={tab.id}
                onClick={() => handleTabClick(tab)}
                disabled={tab.disabled}
                value={tab.label}
              >
                <div
                  className={cn(
                    "text-sm leading-none duration-200 transition-all whitespace-nowrap",
                    isActive
                      ? "text-primary-base font-bold"
                      : "text-neutral-500 font-normal hover:text-neutral-700"
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