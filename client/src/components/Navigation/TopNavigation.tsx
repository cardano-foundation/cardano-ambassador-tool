import React, { useState } from "react";
import { cn } from "@/utils/utils";

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

const TopNavigationTabs: React.FC<TopNavigationTabsProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  className = "",
}) => {
  const [currentActiveId, setCurrentActiveId] = useState(
    activeTabId || tabs[0]?.id,
  );

  const handleTabClick = (tab: TabItem) => {
    if (tab.disabled) return;

    setCurrentActiveId(tab.id);
    onTabChange?.(tab.id, tab);
    tab.onClick?.();
  };

  return (
    <div
      className={cn(
        "self-stretch inline-flex justify-start items-start gap-2.5",
        className,
      )}
    >
      {tabs.map((tab) => {
        const isActive = currentActiveId === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => handleTabClick(tab)}
            disabled={tab.disabled}
            className={cn(
              "flex-shrink-0 px-4 pb-3.5 flex justify-center items-center gap-1",
              "transition-colors duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "touch-manipulation",
              "min-w-0",
              isActive && "border-b-2 border-sunset-500",
            )}
          >
            <div
              className={cn(
                "text-sm  leading-none transition-colors duration-200",
                isActive
                  ? "text-sunset-500 font-bold"
                  : "text-neutral-500 font-normal hover:text-neutral-700",
              )}
            >
              {tab.label}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default TopNavigationTabs;
