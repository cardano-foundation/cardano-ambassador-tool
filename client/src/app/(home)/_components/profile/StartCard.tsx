import Card, { CardContent } from '@/components/atoms/Card';
import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  showHeart?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  showHeart = false,
}) => {
  return (
    <Card
      padding="sm"
      className="border-border/60 h-20 border-2 border-dashed lg:min-w-[150px]"
    >
      <CardContent className="flex h-full flex-col items-center justify-center space-y-1 px-2">
        <div className="text-foreground text-base leading-none font-bold xl:text-xl">
          {value}
        </div>
        <div className="text-muted-foreground flex min-w-0 items-center justify-center gap-1 text-center text-xs leading-tight">
          {showHeart && (
            <span className="text-primary-base shrink-0 text-base">❤</span>
          )}
          <span className="max-w-full truncate" title={label}>
            {label}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
