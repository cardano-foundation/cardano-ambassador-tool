import React from 'react';

interface XIconProps {
  className?: string;
  size?: number | string;
  color?: string;
}

const XIcon: React.FC<XIconProps> = ({
  className = '',
  size = 24,
  color = 'currentColor',
}) => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={color}
      className={className}
    >
      <title>X</title>
      <path d="M18.901 0h3.308l-7.24 8.272L24 24h-7.356l-5.265-8.368L5.408 24H2.1l7.707-8.812L0 0h7.478l4.74 7.533L18.901 0zm-1.161 21.58h1.833L6.433 2.326H4.47l13.27 19.254z" />
    </svg>
  );
};

export default XIcon;
