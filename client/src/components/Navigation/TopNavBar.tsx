"use client";
import React from "react";
import ThemeToggle from "@/components/ThemeToggle";
import Button from "@/components/atoms/Button";
import NotificationIcon from "@/components/atoms/NotificationIcon";

export default function TopNavBar() {
  return (
    <div className="bg-background px-3 sm:px-6 py-4 sm:py-6 flex items-center justify-between">
      <div className="flex-shrink-0">
        <span className="text-primary text-base font-bold">Home</span>
      </div>
      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggle />
        <Button
          variant="outline"
          size="sm"
          className="p-2 bg-background border-none"
        >
          <NotificationIcon />
        </Button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center flex-shrink-0">
          <span className="text-white text-sm font-semibold">JD</span>
        </div>
      </div>
    </div>
  );
}
