type InboxIconProps = {
  className?: string;
  width?: number;
  height?: number;
};

export default function InboxIcon({
  className,
  width = 20,
  height = 20,
}: InboxIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 0 20 20"
      fill="none"
      className={className}
    >
      <path
        d="M5 14.1666C5 14.4594 5 14.6057 5.01306 14.733C5.12146 15.7895 5.8855 16.6622 6.91838 16.9092C7.04279 16.939 7.18792 16.9583 7.47807 16.997L12.9713 17.7295C14.535 17.938 15.3169 18.0422 15.9237 17.8009C16.4565 17.5891 16.9002 17.2006 17.1806 16.7005C17.5 16.1309 17.5 15.3421 17.5 13.7645V6.23535C17.5 4.65781 17.5 3.86904 17.1806 3.29944C16.9002 2.79934 16.4565 2.41082 15.9237 2.19898C15.3169 1.9577 14.535 2.06194 12.9713 2.27043L7.47807 3.00287C7.18788 3.04156 7.04279 3.06091 6.91838 3.09067C5.8855 3.33774 5.12145 4.21043 5.01306 5.2669C5 5.39415 5 5.54053 5 5.83328M10 6.66661L13.3333 9.99995M13.3333 9.99995L10 13.3333M13.3333 9.99995H2.5"
        stroke="#FF5554"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
