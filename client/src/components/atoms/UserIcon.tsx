import React from 'react';

interface UserIconProps {
  className?: string;
}

const UserIcon: React.FC<UserIconProps> = ({ className }) => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <path
        d="M10.6334 9.05835C10.55 9.05002 10.45 9.05002 10.3584 9.05835C8.37505 8.99169 6.80005 7.36669 6.80005 5.36669C6.80005 3.32502 8.45005 1.66669 10.5 1.66669C12.5417 1.66669 14.2 3.32502 14.2 5.36669C14.1917 7.36669 12.6167 8.99169 10.6334 9.05835Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.4666 12.1333C4.44993 13.4833 4.44993 15.6833 6.4666 17.025C8.75827 18.5583 12.5166 18.5583 14.8083 17.025C16.8249 15.675 16.8249 13.475 14.8083 12.1333C12.5249 10.6083 8.7666 10.6083 6.4666 12.1333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UserIcon;
