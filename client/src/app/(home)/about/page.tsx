'use client';

import { useState } from 'react';
import Button from '@/components/atoms/Button';
import Title from '@/components/atoms/Title';
import LinkButton from '@/components/atoms/LinkButton';
import Radio from '@/components/atoms/Radio';
import TextLink from '@/components/atoms/TextLink';
import Modal, { useModal } from '@/components/atoms/Modal';
import Chip from '@/components/atoms/Chip';
import { Progress, ProgressStep } from '@/components/atoms/Progress';
import FolderIcon from '@/components/atoms/FolderIcon';
import Stepper, { SingleRowStepper, useStepper } from '@/components/atoms/Stepper';
import ToastContainer from '@/components/toast/toast';
import { toast } from '@/components/toast/toast-manager';

export default function ComponentShowcase() {
  const [currentStepDemo, setCurrentStepDemo] = useState(1);
  const applicationProgress: ProgressStep[] = [
    {
      id: 'intent-submitted',
      title: 'Intent form submitted with a very long title that might wrap to multiple lines',
      description: 'Today, 2:00 AM - This is a much longer description that demonstrates how the component handles multi-line content gracefully without breaking the layout, Today, 2:00 AM - This is a much longer description that demonstrates how the component handles multi-line content gracefully without breaking the layout, Today, 2:00 AM - This is a much longer description that demonstrates how the component handles multi-line content gracefully without breaking the layout, Today, 2:00 AM - This is a much longer description that demonstrates how the component handles multi-line content gracefully without breaking the layout',
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
      status:  'pending',
    },
];

  return (
    <div className="max-w-4xl mx-auto bg-background">
      <section className="p-6 mb-6">
      <Title className="mb-4 text-neutral">Steps Components</Title>

      <div className="space-y-6">
        <div>
          <Title level="4" className="text-neutral">Cardano Ambassador Steps</Title>
          <div className="space-y-4">
            <div className="p-6 border border-border rounded-lg  flex justify-center">
              <Progress steps={applicationProgress} />
            </div>
          </div>
        </div>
      </div>
    </section>
    </div>
  );
}