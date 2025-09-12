import { copyToClipboard, shortenString } from '@/utils';
import { Copy, ExternalLink } from 'lucide-react';

const Copyable = ({
  keyLabel,
  value,
  link = false,
  withKey = true,
}: {
  keyLabel?: string;
  value: string;
  link?: boolean;
  withKey?: boolean;
}) => {
  console.log({ keyLabel, value });

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="text-neutral">{`${withKey ? keyLabel + ';' : ''} ${shortenString(value, 12)}`}</span>
        <Copy
          className="text-neutral size-4"
          onClick={() => copyToClipboard(value)}
        />
        {link && <ExternalLink className="text-neutral size-4" />}
      </div>
    </>
  );
};

export default Copyable;
