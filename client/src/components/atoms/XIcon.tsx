import React from 'react';

interface XIconProps {
  className?: string;
  size?: number;
  color?: string;
}

const XIcon: React.FC<XIconProps> = ({ 
  className = '', 
  size = 24, 
  color = 'currentColor' 
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M14.095 10.316L22.286 1h-1.940L13.23 9.088L7.551 1H1l8.589 12.231L1 23h1.940l7.51-8.543L16.449 23H23l-8.905-12.684zm-2.658 3.022l-.872-1.218L3.64 2.432h2.98l5.59 7.821.869 1.219 7.265 10.166h-2.982l-5.926-8.3z"
        fill={color}
      />
    </svg>
  );
};

export default XIcon;