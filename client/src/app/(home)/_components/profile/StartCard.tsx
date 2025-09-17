import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  showHeart?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  showHeart = false,
}) => (
  <div className="border-border/60 flex h-16 w-full flex-col justify-center rounded-lg border-2 border-dotted p-3 text-center sm:h-20 sm:w-32 sm:p-4">
    <div className="text-foreground text-xl font-bold sm:text-2xl">{value}</div>
    <div className="text-muted-foreground flex items-center justify-center gap-1 text-xs sm:text-sm">
      {showHeart && <span className="text-primary-base text-base">❤</span>}
      {label}
    </div>
  </div>
);
