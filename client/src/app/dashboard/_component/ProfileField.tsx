interface ProfileFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export default function ProfileField({ label, children, className = "" }: ProfileFieldProps) {
  return (
    <div className={`flex items-start gap-4 sm:gap-3 ${className}`}>
      <div className="text-muted-foreground/60 text-sm lg:w-60">
        {label}:
      </div>
      <div className="text-foreground text-sm flex-1">
        {children}
      </div>
    </div>
  );
}