import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import Link from 'next/link';

export default function MemberStatusCard() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <Title level="6" className="text-foreground mb-1">
              You are now a Cardano Ambassador!
            </Title>
            <Paragraph className="text-muted-foreground text-sm">
              Your membership intent has been accepted. View your full profile for details.
            </Paragraph>
          </div>
        </div>
        <Link href="/dashboard">
          <Button variant="primary" size="sm">
            View Profile
          </Button>
        </Link>
      </div>
    </Card>
  );
}
