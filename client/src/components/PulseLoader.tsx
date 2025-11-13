import React from 'react';

interface PulseLoaderProps {
  className?: string;
  height?: string;
  width?: string;
}

export const PulseLoader: React.FC<PulseLoaderProps> = ({
  className = '',
  height = 'h-4',
  width = 'w-full',
}) => {
  return (
    <div
      className={`bg-muted animate-pulse rounded ${height} ${width} ${className}`}
    />
  );
};

export const StatCardPulse: React.FC = () => (
  <div className="bg-card border-border space-y-2 rounded-lg border p-4">
    <PulseLoader height="h-6" width="w-12" />
    <PulseLoader height="h-4" width="w-20" />
  </div>
);

export const ActivityPulse: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="flex items-start space-x-3">
        <div className="mt-1 flex-shrink-0">
          <PulseLoader height="h-6" width="w-6" className="rounded-full" />
        </div>
        <div className="flex-1 space-y-2">
          <PulseLoader height="h-5" width="w-4/5" />
          <PulseLoader height="h-4" width="w-24" />
        </div>
      </div>
    ))}
  </div>
);

export const TopicsPulse: React.FC = () => (
  <div className="space-y-6">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="bg-muted space-y-3 border-b pb-6 last:border-b-0">
        <PulseLoader height="h-5" width="w-4/5" />
        <div className="flex items-center space-x-6">
          <PulseLoader height="h-4" width="w-20" />
          <div className="flex items-center space-x-2">
            <PulseLoader height="h-4" width="w-4" className="rounded-full" />
            <PulseLoader height="h-4" width="w-8" />
          </div>
        </div>
      </div>
    ))}
  </div>
);

export const RepliesPulse: React.FC = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4, 5].map((i) => (
      <div key={i} className="space-y-2 border-l-4 border-red-400 pl-4">
        <div className="flex items-center space-x-4">
          <PulseLoader height="h-4" width="w-20" />
          <div className="flex items-center space-x-2">
            <PulseLoader height="h-4" width="w-4" className="rounded-full" />
            <PulseLoader height="h-4" width="w-8" />
          </div>
        </div>
        <PulseLoader height="h-5" width="w-3/4" />
      </div>
    ))}
  </div>
);

export const BadgesPulse: React.FC = () => (
  <div className="grid grid-cols-2 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="bg-card border-border space-y-2 rounded-lg border p-3"
      >
        <PulseLoader height="h-6" width="w-6" className="rounded-full" />
        <PulseLoader height="h-4" width="w-24" />
        <PulseLoader height="h-3" width="w-32" />
      </div>
    ))}
  </div>
);
