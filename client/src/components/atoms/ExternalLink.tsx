interface IconProps {
  className?: string;
}

export function ExternalLink({ className = '' }: IconProps) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={`${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M10 1.25H14.5V5.75"
        stroke="#888989"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6.25 9.5L14.5 1.25"
        stroke="#888989"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.25 8.75V13.25C12.25 13.6478 12.092 14.0294 11.8107 14.3107C11.5294 14.592 11.1478 14.75 10.75 14.75H2.5C2.10218 14.75 1.72064 14.592 1.43934 14.3107C1.15804 14.0294 1 13.6478 1 13.25V5C1 4.60218 1.15804 4.22064 1.43934 3.93934C1.72064 3.65804 2.10218 3.5 2.5 3.5H7"
        stroke="#888989"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
