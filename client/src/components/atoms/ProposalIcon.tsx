import React from 'react';

interface ProposalIconProps {
  className?: string;
}

const ProposalIcon: React.FC<ProposalIconProps> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g clipPath="url(#clip0_3062_2606)">
        <path
          d="M12.4999 15H8.33325"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.9999 11.6667H8.33325"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.33341 18.3333H16.6667C17.1088 18.3333 17.5327 18.1577 17.8453 17.8452C18.1578 17.5326 18.3334 17.1087 18.3334 16.6667V3.33332C18.3334 2.8913 18.1578 2.46737 17.8453 2.15481C17.5327 1.84225 17.1088 1.66666 16.6667 1.66666H6.66675C6.22472 1.66666 5.8008 1.84225 5.48824 2.15481C5.17568 2.46737 5.00008 2.8913 5.00008 3.33332V16.6667C5.00008 17.1087 4.82449 17.5326 4.51193 17.8452C4.19937 18.1577 3.77544 18.3333 3.33341 18.3333ZM3.33341 18.3333C2.89139 18.3333 2.46746 18.1577 2.1549 17.8452C1.84234 17.5326 1.66675 17.1087 1.66675 16.6667V9.16666C1.66675 8.72463 1.84234 8.30071 2.1549 7.98815C2.46746 7.67558 2.89139 7.49999 3.33341 7.49999H5.00008"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M14.1666 5H9.16659C8.70635 5 8.33325 5.3731 8.33325 5.83333V7.5C8.33325 7.96024 8.70635 8.33333 9.16659 8.33333H14.1666C14.6268 8.33333 14.9999 7.96024 14.9999 7.5V5.83333C14.9999 5.3731 14.6268 5 14.1666 5Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_3062_2606">
          <rect width="20" height="20" fill="white" />
        </clipPath>
      </defs>
    </svg>
  );
};

export default ProposalIcon;
