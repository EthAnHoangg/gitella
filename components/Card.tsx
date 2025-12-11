import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  color?: string;
  rotate?: boolean;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title,
  color = 'bg-white',
  rotate = false
}) => {
  const rotationClass = rotate ? 'rotate-1 hover:rotate-0 transition-transform duration-300' : '';

  return (
    <div className={`border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] p-8 ${color} ${rotationClass} ${className}`}>
      {title && (
        <div className="border-b-4 border-black pb-4 mb-6 flex justify-between items-center">
          <h3 className="text-2xl font-black uppercase tracking-tighter">
            {title}
          </h3>
          <div className="flex gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-black bg-black"></div>
            <div className="w-4 h-4 rounded-full border-2 border-black bg-transparent"></div>
          </div>
        </div>
      )}
      {children}
    </div>
  );
};