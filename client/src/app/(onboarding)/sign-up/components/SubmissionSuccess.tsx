import Button from '@/components/atoms/Button';
import CardanoLogo from '@/components/atoms/CardanoLogo';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';

const SubmissionSuccess = () => {
  return (
    <div className='w-full flex flex-col gap-4 items-center'>
      <CardanoLogo />
      <div className='flex-col gap-3 text-center'>
          <Title className='text-primary-base!' level="6">Membership intent submitted</Title>
          <Paragraph size='sm'>
            Thank you! Your request to join as an ambassador has been received and
            is under review. We’ll notify you once your application has been
            approved. This may take up to 48 hours.
          </Paragraph>
      </div>
      <Button variant="primary" className="w-full mt-4" onClick={() => {}}>
        View submissions
      </Button>
    </div>
  );
};

export default SubmissionSuccess;
