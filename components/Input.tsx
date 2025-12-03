import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-1 w-full">
      <label className="font-bold text-sm uppercase tracking-wide ml-1">{label}</label>
      <input 
        className={`border-2 border-black p-3 text-lg font-medium focus:outline-none focus:bg-yellow-100 focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all placeholder:text-gray-500 ${className}`}
        {...props} 
      />
    </div>
  );
};
