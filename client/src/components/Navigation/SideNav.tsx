"use client";
import React, { useState } from "react";
import Link from "next/link";
import AppLogo from "../atoms/Logo";

const GridIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
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

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ComponentType;
  active?: boolean;
  onClick?: () => void;
}

interface SideNavigationProps {
  items?: NavigationItem[];
  activeItemId?: string;
  className?: string;
}

const defaultNavigationItems: NavigationItem[] = [
  { id: "home", label: "Home", href: "/", active: true },
  { id: "learn", label: "Learn", href: "/learn" },
  { id: "ambassador", label: "Become an Ambassador", href: "/onboarding/sign-up" },
  { id: "about", label: "About", href: "/about" },
  { id: "ambassadors1", label: "Ambassadors", href: "/ambassadors" },
];

const SideNav: React.FC<SideNavigationProps> = ({
  items = defaultNavigationItems,
  activeItemId = " ",
  className = "",
}) => {
  const [currentActiveId] = useState(activeItemId);

  return (
    <div
      className={`w-80 bg-background border-r border-border h-screen sticky top-0 hidden lg:block ${className}`}
    >
      <div className=" p-6 flex justify-start items-center">
        <AppLogo />
      </div>
      <div className="py-6">
        <nav className="space-y-1">
          {items.map((item) => {
            const IconComponent = item.icon || GridIcon;
            const isActive = item.id === currentActiveId;

            return (
              <Link
                prefetch
                key={item.id}
                href={item.href}
                className={`w-full flex items-center space-x-3 px-6 py-3 text-left rounded-r-lg transition-colors duration-200 hover:bg-muted group ${
                  isActive ? "bg-muted" : ""
                }`}
              >
                {" "}
                <div className="w-5 h-5 flex items-center justify-center text-muted-foreground group-hover:text-foreground flex-shrink-0">
                  <IconComponent />{" "}
                </div>{" "}
                <span className="text-base font-normal text-neutral flex-1 text-left">
                  {item.label}{" "}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
};

export default SideNav;
