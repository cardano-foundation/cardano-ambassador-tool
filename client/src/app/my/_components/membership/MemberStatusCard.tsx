import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import { routes } from '@/config/routes';
import Link from 'next/link';

export default function MemberStatusCard() {
  return (
    <Card>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 animate-pulse rounded-full bg-green-500"></div>
          <div>
            <Title level="6" className="text-foreground mb-1">
              You are now a Cardano Ambassador!
            </Title>
            <Paragraph className="text-muted-foreground text-sm">
              Your membership intent has been accepted. View your full profile
              for details.
            </Paragraph>
          </div>
        </div>
        <Link href={routes.my.profile}>
          <Button variant="primary" size="sm">
            View Profile
          </Button>
        </Link>
      </div>
    </Card>
  );
}
