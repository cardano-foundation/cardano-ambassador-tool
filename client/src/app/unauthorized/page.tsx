'use client';

import Button from '@/components/atoms/Button';
import Card, { CardContent, CardHeader } from '@/components/atoms/Card';
import { toast } from '@/components/toast/toast-manager';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function UnauthorizedPage() {
  const router = useRouter();

  useEffect(() => {
    // Show toast notification
    toast.error(
      'Access Denied',
      'You do not have the required permissions to access this page. Admin role required.',
    );
  }, []);

  const handleGoBack = () => {
    router.back();
  };

  const handleGoHome = () => {
    router.push('/');
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md">
        <CardHeader
          title="Access Denied"
          subtitle="You don't have permission to access this page. Admin privileges are required."
        />
        <div className="flex justify-center px-6 pb-4">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <svg
              className="h-8 w-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
        </div>
        <CardContent>
          <div className="flex flex-col gap-3">
            <Button variant="primary" onClick={handleGoBack} className="w-full">
              Go Back
            </Button>
            <Button variant="outline" onClick={handleGoHome} className="w-full">
              Go to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
