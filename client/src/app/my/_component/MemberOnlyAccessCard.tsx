import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';
import Paragraph from '@/components/atoms/Paragraph';
import TextLink from '@/components/atoms/TextLink';
import Title from '@/components/atoms/Title';
import { routes } from '@/config/routes';
import Link from 'next/link';

interface MemberOnlyAccessCardProps {
  title: string;
  description: string;
  feature: string; // e.g., "submit proposals", "access this feature"
}

export default function MemberOnlyAccessCard({
  title,
  description,
  feature,
}: MemberOnlyAccessCardProps) {
  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto max-w-2xl px-4 py-16">
        <Card className="text-center">
          <div className="mb-6">
            <div className="bg-primary-100 dark:bg-primary-900/20 mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full">
              <svg
                className="text-primary-600 h-8 w-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <Title level="4" className="text-foreground mb-3">
              {title}
            </Title>
            <Paragraph className="text-muted-foreground mx-auto mb-6 max-w-md">
              {description}
            </Paragraph>
          </div>

          <div className="space-y-4">
            <div className="bg-muted/50 mb-6 rounded-lg p-4">
              <Paragraph className="text-muted-foreground text-sm">
                <strong className="text-foreground">Members only:</strong> You
                need to be an approved Cardano Ambassador to {feature}.
              </Paragraph>
            </div>

            <div className="flex flex-col justify-center gap-3 sm:flex-row">
              <Link href={routes.signUp}>
                <Button variant="primary" size="lg">
                  Become a Member
                </Button>
              </Link>
              <Link href={routes.my.submissions}>
                <Button
                  variant="outline"
                  size="lg"
                  className="text-primary-base!"
                >
                  Check Application Status
                </Button>
              </Link>
            </div>

            <div className="pt-4">
              <TextLink href={routes.home} variant="dotted" size="sm">
                ← Back to Home
              </TextLink>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
