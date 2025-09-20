const KeyValue = ({
  keyLabel,
  value,
  className,
}: {
  keyLabel: string;
  value?: string;
  className?: string;
}) => {
  return (
    <div className={`flex gap-8 ${className}`}>
      <span className="text-muted-foreground flex-none">{`${keyLabel}: `}</span>
      <div className="flex-1">
        <span>{value ?? ''}</span>
      </div>
    </div>
  );
};

export default KeyValue;
