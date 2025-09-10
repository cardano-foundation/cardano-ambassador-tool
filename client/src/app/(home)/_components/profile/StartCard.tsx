import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  showHeart?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, showHeart = false }) => (
  <div className="text-center border-2 border-dotted border-border/60 rounded-lg flex flex-col justify-center
    p-3 h-16 w-full sm:p-4 sm:h-20 sm:w-32">
    <div className="text-xl font-bold text-foreground sm:text-2xl">{value}</div>
    <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 sm:text-sm">
      {showHeart && <span className="text-base text-primary-base">❤</span>}
      {label}
    </div>
  </div>
);