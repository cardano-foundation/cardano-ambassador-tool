import React from 'react';

interface UsersIconProps {
  className?: string;
}

const UsersIcon: React.FC<UsersIconProps> = ({ className }) => {
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
        d="M7.63338 9.05835C7.55005 9.05002 7.45005 9.05002 7.35838 9.05835C5.37505 8.99169 3.80005 7.36669 3.80005 5.36669C3.80005 3.32502 5.45005 1.66669 7.50005 1.66669C9.54172 1.66669 11.2 3.32502 11.2 5.36669C11.1917 7.36669 9.61671 8.99169 7.63338 9.05835Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M13.675 3.33331C15.2916 3.33331 16.5917 4.64165 16.5917 6.24998C16.5917 7.82498 15.3417 9.10831 13.7833 9.16665C13.7167 9.15831 13.6417 9.15831 13.5667 9.16665"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3.4666 12.1333C1.44993 13.4833 1.44993 15.6833 3.4666 17.025C5.75827 18.5583 9.5166 18.5583 11.8083 17.025C13.8249 15.675 13.8249 13.475 11.8083 12.1333C9.52494 10.6083 5.7666 10.6083 3.4666 12.1333Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.2834 16.6667C15.8834 16.5417 16.4501 16.3 16.9168 15.9417C18.2168 14.9667 18.2168 13.3584 16.9168 12.3834C16.4584 12.0334 15.9001 11.8 15.3084 11.6667"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UsersIcon;
