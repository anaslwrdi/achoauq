
import React from 'react';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

const Logo: React.FC<LogoProps> = ({ className = '', size = 'md' }) => {
  const sizes = {
    sm: { svg: 'w-10 h-10', text: 'text-xl md:text-2xl', mt: '-mt-1' },
    md: { svg: 'w-24 h-24', text: 'text-4xl md:text-5xl', mt: '-mt-3' },
    lg: { svg: 'w-40 h-40 md:w-56 md:h-56', text: 'text-6xl md:text-[8rem]', mt: '-mt-6 md:-mt-10' }
  };

  const currentSize = sizes[size];

  return (
    <div className={`flex flex-col items-center justify-center overflow-visible select-none ${className}`}>
      <div className={`relative ${currentSize.svg} group cursor-pointer flex items-center justify-center z-10`}>
        <div className="absolute inset-0 bg-[#ff4d6d]/10 blur-[50px] rounded-full opacity-40 group-hover:opacity-80 transition-all duration-1000 group-hover:scale-125"></div>
        
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg" 
          className="relative w-full h-full drop-shadow-[0_15px_30px_rgba(0,0,0,0.6)] transform transition-all duration-700 ease-out group-hover:scale-110"
        >
          {/* تصميم أيقونة أشواق الأصلية */}
          <path d="M50 35C50 35 45 25 35 25C25 25 20 33 20 40C20 55 50 75 50 75C50 75 80 55 80 40C80 33 75 25 65 25C55 25 50 35 50 35Z" fill="url(#ashwaqGrad)" />
          <path d="M50 45L45 50L50 55L55 50L50 45Z" fill="#d4af37" className="animate-pulse" />
          
          <defs>
            <linearGradient id="ashwaqGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#9b1c31" />
              <stop offset="100%" stopColor="#ff4d6d" />
            </linearGradient>
          </defs>
        </svg>
      </div>
      
      <div className={`relative w-full overflow-visible px-4 ${currentSize.mt}`}>
        <div className="relative inline-block w-full text-center">
          <h1 className={`absolute inset-0 font-bold leading-none ${currentSize.text} text-black opacity-40 blur-lg transform translate-y-3 pointer-events-none font-amiri`}>
            أشواق.
          </h1>
          
          <h1 
            className={`relative font-bold leading-none shimmer-text ${currentSize.text} py-6 md:py-10 font-amiri`}
            style={{ filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.5))' }}
          >
            أشواق
            <span className="text-[#d4af37] animate-pulse">.</span>
          </h1>
        </div>
      </div>
    </div>
  );
};

export default Logo;
