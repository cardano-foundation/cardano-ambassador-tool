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
      className="border-2 border-dotted border-border/60 h-20 sm:h-20 w-full"
    >
      <CardContent className="flex flex-col justify-center items-center h-full space-y-0">
        <div className="text-xl font-bold text-foreground sm:text-2xl">
          {value}
        </div>
        <div className="text-xs text-muted-foreground flex items-center justify-center gap-1 sm:text-sm">
          {showHeart && (
            <span className="text-base text-primary-base">❤</span>
          )}
          {label}
        </div>
      </CardContent>
    </Card>
  );
};