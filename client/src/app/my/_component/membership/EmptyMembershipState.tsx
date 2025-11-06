import Button from '@/components/atoms/Button';
import Empty from '@/components/atoms/Empty';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import { routes } from '@/config/routes';
import Link from 'next/link';

export default function EmptyMembershipState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <Empty />
      <div className="mt-6 max-w-md text-center">
        <Title level="6" className="text-foreground mb-3">
          No Membership Application Submission
        </Title>
        <Paragraph className="text-muted-foreground mb-4">
          You haven't submitted a membership application yet. Start your
          journey to become a Cardano Ambassador by submitting your
          application.
        </Paragraph>
        <Paragraph className="text-muted-foreground mb-6 ">
          Just submitted an application? Click the refresh button above
          to check for your latest submission.
        </Paragraph>
        <Link href={routes.signUp}>
          <Button variant="primary" size="lg">
            Become an Ambassador
          </Button>
        </Link>
      </div>
    </div>
  );
}