import Button from '@/components/atoms/Button';
import Empty from '@/components/atoms/Empty';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import Link from 'next/link';

export default function EmptyProposalIntentState() {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center">
      <Empty />
      <div className="mt-6 max-w-md text-center">
        <Title level="6" className="text-foreground mb-3">
          No Proposal Intent Submissions
        </Title>
        <Paragraph className="text-muted-foreground mb-6">
          You haven't submitted any proposals yet. Share your ideas and
          contribute to the Cardano ecosystem by submitting a proposal.
        </Paragraph>
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/proposals/new">
            <Button variant="primary">Submit Proposal</Button>
          </Link>
          <Link href="/proposals">
            <Button variant="outline" className="text-primary-base!">
              Browse Proposals
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
