'use client';

import { Timeline } from '@/components/atoms/Timeline';
import Title from '@/components/atoms/Title';
import { TimelineStep } from '@types';
import { TableTestPage } from '../_components/TableTestPage';

export default function ComponentShowcase() {
  const applicationProgress: TimelineStep[] = [
    {
      id: 'intent-submitted',
      title:
        'Intent form submitted with a very long title that might wrap to multiple lines',
      content: (
        <div className="text-muted-foreground text-base font-medium">
          Today, 2:00 AM - This is a much longer description that demonstrates
          how the component handles multi-line content gracefully without
          breaking the layout, Today, 2:00 AM - This is a much longer
          description that demonstrates how the component handles multi-line
          content gracefully without breaking the layout, Today, 2:00 AM - This
          is a much longer description that demonstrates how the component
          handles multi-line content gracefully without breaking the layout,
          Today, 2:00 AM - This is a much longer description that demonstrates
          how the component handles multi-line content gracefully without
          breaking the layout
        </div>
      ),
      status: 'completed',
    },
    {
      id: 'admin-review',
      title: 'Admin Review In Progress',
      content: (
        <div className="text-muted-foreground text-base font-medium">2 hours ago</div>
      ),
      status: 'current',
    },
    {
      id: 'member-approval',
      title: 'Member Approval',
      content: (
        <div className="text-muted-foreground text-base font-medium">
          Pending approval
        </div>
      ),
      status: 'pending',
    },
    {
      id: 'membership-activated',
      title: 'Membership activated',
      content: (
        <div className="text-muted-foreground text-base font-medium">
          Welcome to Cardano!
        </div>
      ),
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
                <Timeline steps={applicationProgress} />
              </div>
            </div>
          </div>
        </div>
        <TableTestPage />
      </section>
    </div>
  );
}
