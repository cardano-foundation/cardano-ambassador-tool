import React from 'react';
import Card, { CardContent } from '@/components/atoms/Card';

interface StatCardProps {
  label: string;
  value: number;
  showHeart?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  showHeart = false
}) => {
  return (
    <Card
      padding="sm"
      className="border-2 border-dotted border-border/60 h-20 lg:min-w-[150px]"
    >
      <CardContent className="flex flex-col justify-center items-center h-full space-y-1 px-2">
        <div className="text-base xl:text-xl font-bold text-foreground leading-none">
          {value}
        </div>
        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 text-center leading-tight min-w-0">
          {showHeart && (
            <span className="text-base text-primary-base flex-shrink-0">❤</span>
          )}
          <span className="truncate max-w-full" title={label}>
            {label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};