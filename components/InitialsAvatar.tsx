import React from 'react';

interface InitialsAvatarProps {
  initials: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeClasses = {
  sm: 'w-12 h-12 text-sm',
  md: 'w-16 h-16 text-lg',
  lg: 'w-20 h-20 text-xl'
};

const getRandomColor = (initials: string) => {
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-red-500',
    'bg-yellow-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-cyan-500'
  ];
  
  // Use initials to consistently generate the same color for the same person
  const index = initials.charCodeAt(0) + initials.charCodeAt(1);
  return colors[index % colors.length];
};

export default function InitialsAvatar({ initials, size = 'md', className = '' }: InitialsAvatarProps) {
  const colorClass = getRandomColor(initials);
  const sizeClass = sizeClasses[size];

  return (
    <div 
      className={`${sizeClass} ${colorClass} rounded-lg flex items-center justify-center text-white font-semibold ${className}`}
      title={initials}
    >
      {initials}
    </div>
  );
} 