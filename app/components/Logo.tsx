interface LogoProps {
  size?: number;
  className?: string;
}

export default function Logo({ size = 24, className = "" }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-label="Applicable logo"
    >
      <path
        d="M12 2L2 20h20L12 2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M12 10L7 20h10L12 10Z"
        stroke="currentColor"
        strokeWidth="1"
        strokeLinejoin="round"
        opacity="0.4"
      />
    </svg>
  );
}
