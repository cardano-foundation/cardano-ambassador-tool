import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';

export default function DashboardHeader() {
  return (
    <div className="mb-6 px-6">
      <div className="mb-2">
        <Title level="5" className="text-neutral">
          Profile overview
        </Title>
        <Paragraph className="text-muted-foreground">
          An overview of your ambassador profile
        </Paragraph>
      </div>
    </div>
  );
}