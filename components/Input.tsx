import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}

export const Input: React.FC<InputProps> = ({ label, className = '', ...props }) => {
  return (
    <div className="flex flex-col gap-2 w-full group">
      <label className="font-black text-lg uppercase tracking-widest ml-1 bg-black text-white inline-block px-2 w-fit transform -rotate-1 group-focus-within:rotate-0 transition-transform">
        {label}
      </label>
      <input 
        className={`border-4 border-black p-4 text-xl font-bold focus:outline-none focus:bg-[#FDFFB6] focus:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1 focus:-translate-x-1 transition-all placeholder:text-gray-400 ${className}`}
        {...props} 
      />
    </div>
  );
};