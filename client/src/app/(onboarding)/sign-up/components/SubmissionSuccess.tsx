import Button from '@/components/atoms/Button';
import CardanoLogo from '@/components/atoms/CardanoLogo';
import LinkButton from '@/components/atoms/LinkButton';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';

const SubmissionSuccess = () => {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <CardanoLogo />
      <div className="flex-col gap-3 text-center">
        <Title className="text-primary-base!" level="6">
          Membership intent submitted
        </Title>
        <Paragraph size="sm">
          Thank you! Your request to join as an ambassador has been received and
          is under review. We’ll notify you once your application has been
          approved. This may take up to 48 hours.
        </Paragraph>
      </div>
      <LinkButton
        href="/dashboard/submissions"
        variant="primary"
        className="mt-4 w-full"
      >
        View submissions
      </LinkButton>
    </div>
  );
};

export default SubmissionSuccess;
