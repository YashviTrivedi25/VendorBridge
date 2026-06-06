export default function Logo({ className = "w-10 h-10" }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center shrink-0 ${className}`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-md">
        {/* Left Ribbon */}
        <path d="M50 20 L25 60 L35 75 L60 35 Z" fill="#0ea5e9" opacity="0.9" />
        {/* Right Ribbon */}
        <path d="M50 20 L75 60 L65 75 L40 35 Z" fill="#0284c7" opacity="0.9" />
        {/* Horizontal Ribbons */}
        <path d="M25 60 L75 60 L65 75 L35 75 Z" fill="#0369a1" opacity="0.9" />
        
        {/* Center triangle cutouts to simulate the ribbon overlapping */}
        <path d="M50 40 L40 55 L60 55 Z" fill="none" stroke="#fff" strokeWidth="2" opacity="0.5" />
      </svg>
    </div>
  );
}
