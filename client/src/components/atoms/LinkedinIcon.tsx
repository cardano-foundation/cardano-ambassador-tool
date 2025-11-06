import React from 'react';

interface LinkedInIconProps {
  className?: string;
  size?: number;
  color?: string;
}

const LinkedInIcon: React.FC<LinkedInIconProps> = ({
  className = '',
  size = 24,
  color = 'currentColor',
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M6.87499 0.094986C3.07801 0.094986 0 3.173 0 6.96997C0 10.7669 3.07801 13.845 6.87499 13.845C10.672 13.845 13.75 10.7669 13.75 6.96997C13.75 3.173 10.6719 0.094986 6.87499 0.094986ZM5.04073 10.2937H3.53125V5.41704H5.04073V10.2937ZM4.2788 4.7784C3.78582 4.7784 3.38617 4.37549 3.38617 3.87857C3.38617 3.38159 3.78587 2.97871 4.2788 2.97871C4.77172 2.97871 5.17136 3.38159 5.17136 3.87857C5.17139 4.37552 4.77175 4.7784 4.2788 4.7784ZM10.6975 10.2937H9.19532V7.73386C9.19532 7.03177 8.92863 6.63986 8.37347 6.63986C7.76927 6.63986 7.45362 7.04803 7.45362 7.73386V10.2937H6.00586V5.41704H7.45362V6.07384C7.45362 6.07384 7.88911 5.26828 8.92316 5.26828C9.95725 5.26828 10.6975 5.89969 10.6975 7.20587L10.6975 10.2937Z"
        fill="url(#paint0_linear_455_11596)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_455_11596"
          x1="2.01363"
          y1="2.10862"
          x2="11.7363"
          y2="11.8313"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#2489BE" />
          <stop offset="1" stopColor="#0575B3" />
        </linearGradient>
      </defs>
    </svg>
  );
};

export default LinkedInIcon;
