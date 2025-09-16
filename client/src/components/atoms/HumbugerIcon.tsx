type HambugerIconProps = {
  className?: string;
  width?: number;
  height?: number;
};

export default function HambugerIcon({
  className,
  width = 200,
  height = 180,
}: HambugerIconProps) {
  return (
    <svg width="20" height="14" viewBox="0 0 20 14" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M1 7H13M1 1H19M1 13H19" stroke="#344054" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}