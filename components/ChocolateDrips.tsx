import React, { useMemo } from 'react';

export const ChocolateDrips: React.FC = React.memo(() => {
  // Generate random values once and cache them so they don't change on re-renders
  const drips = useMemo(() => {
    return Array.from({ length: 20 }).map((_, i) => ({
      left: `${i * 5}%`,
      width: '60px',
      height: `${Math.random() * 80 + 40}px`, // Random height between 40px and 120px
      animationDuration: `${Math.random() * 2 + 1}s` // Random duration between 1s and 3s
    }));
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-16 bg-[#2B1810] z-0 pointer-events-none" style={{ filter: 'url(#goo)' }}>
      {drips.map((drip, i) => (
        <div
          key={i}
          className="absolute top-0 bg-[#2B1810] rounded-b-full animate-wiggle"
          style={{
            left: drip.left,
            width: drip.width,
            height: drip.height,
            animationDuration: drip.animationDuration
          }}
        />
      ))}
    </div>
  );
});
