import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  showHeart?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, showHeart = false }) => (
  <div className="text-center border-2 border-dotted border-border/60 p-4 rounded-lg w-32 h-20 flex flex-col justify-center">
    <div className="text-2xl font-bold text-foreground">{value}</div>
    <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
      {showHeart && <span className="text-base text-primary-base">❤</span>}
      {label}
    </div>
  </div>
);