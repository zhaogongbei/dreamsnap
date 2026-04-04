import { useState, useEffect } from 'react';

interface CyberThemeCardProps {
  id: string;
  name: string;
  nameZh: string;
  previewImage: string;
  description: string;
  category: string;
  isSelected: boolean;
  onSelect: () => void;
}

export const CyberThemeCard: React.FC<CyberThemeCardProps> = ({
  name,
  nameZh,
  previewImage,
  description,
  isSelected,
  onSelect,
}) => {
  return (
    <div
      onClick={onSelect}
      className={`
        relative group cursor-pointer rounded-2xl overflow-hidden
        transition-all duration-500 ease-out
        ${isSelected
          ? 'scale-[1.03] ring-2 ring-cyan-400 shadow-[0_0_30px_rgba(34,211,238,0.3)]'
          : 'hover:scale-[1.03] hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]'
        }
      `}
    >
      {/* Glow effect behind */}
      <div className={`
        absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
        bg-gradient-to-br from-cyan-500/10 via-transparent to-pink-500/10 blur-xl
        ${isSelected ? 'opacity-100' : ''}
      `} />

      {/* Card background */}
      <div className="relative bg-gradient-to-br from-gray-900/90 to-gray-950/90 backdrop-blur-xl border border-gray-700/50">
        {/* Image container */}
        <div className="relative aspect-[3/4] overflow-hidden">
          <img
            src={previewImage}
            alt={nameZh}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />

          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/20 to-transparent" />

          {/* Scanline effect */}
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(34,211,238,0.03) 2px, rgba(34,211,238,0.03) 4px)',
            }}
          />

          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-xl" />
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-pink-400/50 rounded-tr-xl" />
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-pink-400/50 rounded-bl-xl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-cyan-400/50 rounded-br-xl" />

          {/* Selection badge */}
          {isSelected && (
            <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-cyan-400 flex items-center justify-center animate-pulse">
              <svg className="w-5 h-5 text-gray-900" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Info section */}
        <div className="relative p-4">
          {/* Glitch text effect on hover */}
          <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors relative">
            <span className="relative z-10">{nameZh}</span>
            <span className="absolute inset-0 text-pink-400 opacity-0 group-hover:opacity-70 blur-[1px] translate-x-[-2px] transition-opacity">{nameZh}</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1 line-clamp-1">{description}</p>

          {/* Neon underline */}
          <div className={`
            h-[2px] mt-3 rounded-full transition-all duration-500
            ${isSelected
              ? 'bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]'
              : 'bg-gray-700 group-hover:bg-gradient-to-r group-hover:from-cyan-400/50 group-hover:to-pink-400/50'
            }
          `} />
        </div>
      </div>
    </div>
  );
};

// Cyberpunk category pill
interface CyberCategoryPillProps {
  label: string;
  isActive: boolean;
  onClick: () => void;
}

export const CyberCategoryPill: React.FC<CyberCategoryPillProps> = ({
  label,
  isActive,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`
        relative px-5 py-2.5 rounded-full text-sm font-medium
        transition-all duration-300 overflow-hidden
        ${isActive
          ? 'text-gray-900'
          : 'text-gray-300 hover:text-white'
        }
      `}
    >
      {/* Animated background */}
      <span className={`
        absolute inset-0 transition-all duration-300
        ${isActive
          ? 'bg-gradient-to-r from-cyan-400 to-pink-400 shadow-[0_0_20px_rgba(34,211,238,0.4)]'
          : 'bg-gray-800/50 border border-gray-700 hover:border-cyan-400/30'
        }
      `} />

      {/* Glitch line */}
      <span className={`
        absolute bottom-0 left-0 h-[2px] transition-all duration-300
        ${isActive
          ? 'w-full bg-white/50'
          : 'w-0 group-hover:w-full bg-cyan-400/50'
        }
      `} />

      {/* Text */}
      <span className="relative z-10">{label}</span>
    </button>
  );
};

// Cyberpunk progress ring for AI generation
interface CyberProgressRingProps {
  progress: number;
  status: string;
  elapsedTime: string;
}

export const CyberProgressRing: React.FC<CyberProgressRingProps> = ({
  progress,
  status,
  elapsedTime,
}) => {
  const [displayProgress, setDisplayProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setDisplayProgress(progress), 100);
    return () => clearTimeout(timer);
  }, [progress]);

  const circumference = 2 * Math.PI * 70;
  const strokeDashoffset = circumference - (displayProgress / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      {/* Outer glow ring */}
      <div className="absolute w-[180px] h-[180px] rounded-full bg-gradient-to-br from-cyan-500/20 to-pink-500/20 blur-xl animate-pulse" />

      {/* Main progress ring */}
      <svg className="w-[180px] h-[180px] -rotate-90" viewBox="0 0 160 160">
        {/* Background track */}
        <circle
          cx="80" cy="80" r="70"
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="8"
        />

        {/* Progress gradient */}
        <defs>
          <linearGradient id="cyberProgress" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="50%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        <circle
          cx="80" cy="80" r="70"
          fill="none"
          stroke="url(#cyberProgress)"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          filter="url(#glow)"
          className="transition-all duration-700 ease-out"
        />

        {/* Tick marks */}
        {[...Array(12)].map((_, i) => (
          <line
            key={i}
            x1="80" y1="5" x2="80" y2="12"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth="2"
            transform={`rotate(${i * 30} 80 80)`}
          />
        ))}
      </svg>

      {/* Center content */}
      <div className="absolute flex flex-col items-center">
        <span className="text-4xl font-bold text-white tabular-nums">
          {displayProgress}%
        </span>
        <span className="text-xs text-cyan-400 mt-1">PROCESSING</span>
      </div>

      {/* Status text */}
      <p className="mt-6 text-lg text-white/80 font-medium">{status}</p>
      <p className="text-sm text-gray-500 mt-1">⏱ {elapsedTime}</p>

      {/* Animated scan lines */}
      <div className="absolute w-[180px] h-[180px] pointer-events-none overflow-hidden rounded-full">
        <div
          className="absolute w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50 animate-[scan_2s_linear_infinite]"
          style={{
            animation: 'scan 2s linear infinite',
            boxShadow: '0 0 20px rgba(34,211,238,0.5)',
          }}
        />
      </div>
    </div>
  );
};

// Cyberpunk glass card
interface CyberGlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: 'cyan' | 'pink' | 'purple' | 'none';
}

export const CyberGlassCard: React.FC<CyberGlassCardProps> = ({
  children,
  className = '',
  glow = 'none',
}) => {
  const glowColors = {
    cyan: 'hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]',
    pink: 'hover:shadow-[0_0_30px_rgba(236,72,153,0.2)]',
    purple: 'hover:shadow-[0_0_30px_rgba(168,85,247,0.2)]',
    none: '',
  };

  return (
    <div
      className={`
        relative bg-gradient-to-br from-gray-900/80 to-gray-950/80
        backdrop-blur-xl rounded-2xl border border-gray-700/50
        transition-all duration-300 hover:border-gray-600
        ${glowColors[glow]} ${className}
      `}
    >
      {/* Corner decorations */}
      <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-cyan-400/30 rounded-tl-xl" />
      <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-pink-400/30 rounded-tr-xl" />
      <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-pink-400/30 rounded-bl-xl" />
      <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-cyan-400/30 rounded-br-xl" />

      {children}
    </div>
  );
};

// Neon button
interface CyberButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const CyberButton: React.FC<CyberButtonProps> = ({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className = '',
  disabled = false,
}) => {
  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  const variants = {
    primary: `
      bg-gradient-to-r from-cyan-500 to-pink-500 text-white
      shadow-[0_0_20px_rgba(34,211,238,0.3)]
      hover:shadow-[0_0_30px_rgba(34,211,238,0.5)]
      hover:scale-105 active:scale-95
    `,
    secondary: `
      bg-gray-800/80 text-white border border-gray-600
      hover:border-cyan-400 hover:text-cyan-300
      shadow-lg hover:shadow-cyan-400/10
    `,
    ghost: `
      text-gray-300 hover:text-white
      hover:bg-gray-800/50
    `,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative rounded-xl font-semibold transition-all duration-300
        overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed
        ${sizes[size]} ${variants[variant]} ${className}
      `}
    >
      {/* Shimmer effect */}
      <span className="absolute inset-0 -translate-x-full hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      {/* Text */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </button>
  );
};

// Animated grid background
export const CyberGridBackground: React.FC = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Base gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950" />

      {/* Grid pattern */}
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `
            linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(34,211,238,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 rounded-full bg-cyan-500/10 blur-[100px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 rounded-full bg-pink-500/10 blur-[100px] animate-pulse" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-purple-500/5 blur-[120px]" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          opacity: 0.03,
        }}
      />
    </div>
  );
};

// Typewriter effect text
export const CyberGlitchText: React.FC<{
  text: string;
  className?: string;
}> = ({ text, className = '' }) => {
  const [displayText, setDisplayText] = useState('');
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    let currentIndex = 0;
    const timer = setInterval(() => {
      if (currentIndex < text.length) {
        setDisplayText(text.slice(0, currentIndex + 1));
        currentIndex++;
      } else {
        clearInterval(timer);
      }
    }, 80);

    return () => clearInterval(timer);
  }, [text]);

  return (
    <span className={`relative inline-block ${className}`}>
      <span className="text-cyan-300">{displayText}</span>
      <span className="absolute inset-0 text-pink-400 opacity-0 animate-pulse">
        {displayText}
      </span>
      <span className="absolute inset-0 animate-ping text-white/20" style={{ animationDuration: '2s' }}>
        {displayText}
      </span>
    </span>
  );
};
