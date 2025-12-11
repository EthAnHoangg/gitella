import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'black';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading, 
  className = '', 
  ...props 
}) => {
  const baseStyles = "relative px-8 py-4 font-black text-xl uppercase tracking-tighter border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[8px] active:translate-y-[8px] active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-rotate-1";
  
  const variants = {
    primary: "bg-[#B8FF9F] text-black hover:bg-[#fff]", // Acid Green -> White
    secondary: "bg-[#A0C4FF] text-black hover:bg-[#B8FF9F]", // Blue -> Green
    danger: "bg-[#FF9F1C] text-black hover:bg-[#FFADAD]", // Orange -> Red
    black: "bg-black text-white hover:bg-gray-900"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className}`}
      disabled={isLoading || props.disabled}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-3">
          <span className="animate-spin text-2xl">⏳</span>
          COOKING...
        </span>
      ) : children}
    </button>
  );
};