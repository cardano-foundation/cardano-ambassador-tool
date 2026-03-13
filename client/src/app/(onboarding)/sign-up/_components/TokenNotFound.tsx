import CardanoLogo from "../../../../components/atoms/CardanoLogo";
import Paragraph from "../../../../components/atoms/Paragraph";
import TextLink from "../../../../components/atoms/TextLink";
import Title from "../../../../components/atoms/Title";
import { getCurrentNetworkConfig } from "../../../../config/cardano";

const ANDAMIO_URLS: Record<string, string> = {
  preprod: "https://preprod.app.andamio.io/",
  mainnet: "https://mainnet.app.andamio.io/",
};

const TokenNotFound = () => {
  const network = getCurrentNetworkConfig().network;
  const andamioUrl = ANDAMIO_URLS[network] || ANDAMIO_URLS.preprod;

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
        <Paragraph size="sm" className="pt-2">
          You can get your Andamio token at{" "}
          <TextLink href={andamioUrl} variant="dotted">
            {andamioUrl}
          </TextLink>
        </Paragraph>
      </div>
      <div className="flex justify-center gap-2 pt-4 lg:pt-6">
        <span className="text-muted-foreground text-sm">Need Help? </span>
        <TextLink href="#" variant="dotted">
          {" "}
          Contact support{" "}
        </TextLink>
      </div>
    </div>
  );
};

export default TokenNotFound;
