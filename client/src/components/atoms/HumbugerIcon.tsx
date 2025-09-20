type HamburgerIconProps = {
  className?: string;
  width?: number;
  height?: number;
};

export default function HamburgerIcon({
  className,
  width = 20,
  height = 14,
}: HamburgerIconProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 20 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M1 7H13M1 1H19M1 13H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
