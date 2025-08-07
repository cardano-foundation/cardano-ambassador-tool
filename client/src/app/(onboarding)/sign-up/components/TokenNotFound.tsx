import CardanoLogo from '@/components/atoms/CardanoLogo';
import Paragraph from '@/components/atoms/Paragraph';
import Title from '@/components/atoms/Title';
import Link from 'next/link';

const TokenNotFound = () => {
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <CardanoLogo />
      <div className="flex-col gap-2 text-center">
        <Title className="text-primary-base!" level="6">
          Access Denied: No Valid Token Found
        </Title>
        <Paragraph size="sm">
          To proceed, you must hold a valid CIP-68 membership token in your
          connected wallet. Please ensure your wallet is correctly connected and
          contains the required token.
        </Paragraph>
      </div>
      <div className="flex justify-center lg:pt-6 pt-4 gap-2">
        <span className="text-muted-foreground text-sm">Need Help? </span>
        <Link
          href={'#'}
          className="decoration-primary-400 cursor-pointer border-none bg-transparent p-0 text-sm font-medium underline decoration-dotted underline-offset-4"
        >
          <span className="text-primary-400 text-base font-medium">
            Contact support
          </span>
        </Link>
      </div>
    </div>
  );
};

export default TokenNotFound;
