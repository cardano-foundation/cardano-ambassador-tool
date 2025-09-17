'use client';

import { Progress, ProgressStep } from '@/components/atoms/Progress';
import Title from '@/components/atoms/Title';
import { TableTestPage } from '../_components/TableTestPage';

export default function ComponentShowcase() {
  const applicationProgress: ProgressStep[] = [
    {
      id: 'intent-submitted',
      title:
        'Intent form submitted with a very long title that might wrap to multiple lines',
      description:
        'Today, 2:00 AM - This is a much longer description that demonstrates how the component handles multi-line content gracefully without breaking the layout, Today, 2:00 AM - This is a much longer description that demonstrates how the component handles multi-line content gracefully without breaking the layout, Today, 2:00 AM - This is a much longer description that demonstrates how the component handles multi-line content gracefully without breaking the layout, Today, 2:00 AM - This is a much longer description that demonstrates how the component handles multi-line content gracefully without breaking the layout',
      status: 'completed',
    },
    {
      id: 'admin-review',
      title: 'Admin Review In Progress',
      description: '2 hours ago',
      status: 'current',
    },
    {
      id: 'member-approval',
      title: 'Member Approval',
      description: 'Pending approval',
      status: 'pending',
    },
    {
      id: 'membership-activated',
      title: 'Membership activated',
      description: 'Welcome to Cardano!',
      status: 'pending',
    },
  ];

  return (
    <div className="bg-background mx-auto max-w-4xl">
      <section className="mb-6 p-6">
        <Title className="text-neutral mb-4">Steps Components</Title>

        <div className="space-y-6">
          <div>
            <Title level="4" className="text-neutral">
              Cardano Ambassador Steps
            </Title>
            <div className="space-y-4">
              <div className="border-border flex justify-center rounded-lg border p-6">
                <Progress steps={applicationProgress} />
              </div>
            </div>
          </div>
        </div>
        <TableTestPage />
      </section>
    </div>
  );
}
