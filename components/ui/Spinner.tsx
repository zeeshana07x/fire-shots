interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 36,
};

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const px = sizeMap[size];

  return (
    <svg
      width={px}
      height={px}
      viewBox="0 0 24 24"
      fill="none"
      className={`animate-spin ${className}`}
      role="status"
      aria-label="Loading"
    >
      <circle
        cx="12"
        cy="12"
        r="10"
        stroke="var(--border-medium)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M12 2a10 10 0 0 1 10 10"
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
