type SoccerBallIconProps = {
  className?: string;
};

export function SoccerBallIcon({ className }: SoccerBallIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 7l3.5 2.5-1.3 4.1h-4.4L8.5 9.5 12 7z" />
      <path d="M12 7V3.5" />
      <path d="M15.5 9.5l3.3-1.2" />
      <path d="M13.9 13.6l2.1 3.1" />
      <path d="M10.1 13.6l-2.1 3.1" />
      <path d="M8.5 9.5L5.2 8.3" />
    </svg>
  );
}
