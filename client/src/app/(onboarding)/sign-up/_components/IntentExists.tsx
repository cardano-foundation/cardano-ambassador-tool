import Button from '@/components/atoms/Button';
import CardanoLogo from '@/components/atoms/CardanoLogo';
import LinkButton from '@/components/atoms/LinkButton';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import { routes } from '@/config/routes';

const IntentExists = ({
  goBack
}: {
  goBack: () => void;
}) => {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <CardanoLogo />
      <div className="flex-col gap-3 text-center">
        <Title level="6">
          Intent already existing
        </Title>
        <Paragraph size="sm">
          There is a pending membership intent with the selected address.
        </Paragraph>
      </div>
      <div className="mt-6 flex w-full justify-between gap-2">
        <Button
          variant="outline"
          onClick={goBack}
          className="text-primary-base! rounded-lg!"
        >
          Back
        </Button>

        <LinkButton
          href={routes.my.submissions}
          variant="primary"
          className="w-full"
        >
          View submissions
        </LinkButton>
      </div>
    </div>
  );
};

export default IntentExists;
