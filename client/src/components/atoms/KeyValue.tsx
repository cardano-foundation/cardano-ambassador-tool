const KeyValue = ({ keyLabel, value }: { keyLabel: string; value: string }) => {
  return (
    <div>
      <span className="text-muted-foreground">{`${keyLabel}: `}</span>
      <span>{value}</span>
    </div>
  );
};

export default KeyValue;
