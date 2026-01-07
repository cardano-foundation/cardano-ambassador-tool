export default function ProgressTrackerLoading() {
  return (
    <div className="space-y-6">
      {/* Signers List Skeleton */}
      <div className="space-y-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex max-w-lg justify-between py-2">
            <div className="mr-4 flex-1 animate-pulse">
              <div className="h-4 w-3/4 rounded bg-gray-200"></div>
            </div>
            <div className="flex animate-pulse items-center gap-2">
              <div className="h-4 w-4 rounded bg-gray-200"></div>
              <div className="h-4 w-24 rounded bg-gray-200"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Progress Tracker Skeleton */}
      <div className="max-w-lg space-y-4">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-32 rounded bg-gray-200"></div>
        </div>

        {/* Progress Bar Skeleton */}
        <div className="space-y-3">
          <div className="animate-pulse">
            <div className="relative h-2 w-full rounded-full bg-gray-200">
              <div className="absolute top-1/2 left-0 -ml-1.5 h-3 w-3 -translate-y-1/2 transform rounded-full bg-gray-300"></div>
            </div>
          </div>

          {/* Progress Text Skeleton */}
          <div className="animate-pulse">
            <div className="h-4 w-40 rounded bg-gray-200"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
