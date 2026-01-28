export default function LogoIcon({ size = 32, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 32 32" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <rect width="32" height="32" rx="8" fill="url(#logo-gradient)" />
      <path 
        d="M8 12L12 20L16 12L20 20L24 12" 
        stroke="white" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        fill="none"
      />
      <defs>
        <linearGradient id="logo-gradient" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF007A" />
          <stop offset="1" stopColor="#7B3FE4" />
        </linearGradient>
      </defs>
    </svg>
  );
}
