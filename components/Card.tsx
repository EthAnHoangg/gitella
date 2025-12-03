import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  color?: string;
}

export const Card: React.FC<CardProps> = ({ 
  children, 
  className = '', 
  title,
  color = 'bg-white' 
}) => {
  return (
    <div className={`border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] p-6 ${color} ${className}`}>
      {title && (
        <h3 className="text-xl font-bold border-b-2 border-black pb-2 mb-4 uppercase tracking-tighter">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
};
