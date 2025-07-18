import React, { useState } from "react";
import { cn } from "@/utils/utils";
import { Tabs, TabsList, TabsTrigger } from "../Tabs";

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
    <Tabs
      className={cn(
        "self-stretch inline-flex justify-start items-start gap-2.5",
        className
      )}
    >
      <TabsList className="no-scrollbar overflow-x-auto scroll-smooth whitespace-nowrap">
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
                  "text-sm  leading-none  duration-200 transition-all",
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
  );
};

export default TopNav;
