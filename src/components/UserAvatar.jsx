import React from 'react';

const UserAvatar = ({ 
  user, 
  size = 'md', 
  className = '', 
  showBorder = true,
  borderColor = 'primary-500/30',
  hoverBorderColor = 'primary-400/50'
}) => {
  // Size variants
  const sizeClasses = {
    xs: 'w-6 h-6 text-xs',
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-base',
    lg: 'w-12 h-12 text-lg',
    xl: 'w-16 h-16 text-xl',
    '2xl': 'w-20 h-20 text-2xl',
    '3xl': 'w-24 h-24 text-3xl'
  };

  // Get user initials
  const getInitials = (user) => {
    if (!user) return 'U';
    
    const name = user.name || user.nickname || '';
    if (!name) return 'U';
    
    // Split by spaces and get first letter of each word
    const words = name.trim().split(' ');
    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase();
    }
    
    // Return first letter of first and last word
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  const sizeClass = sizeClasses[size] || sizeClasses.md;
  const borderClasses = showBorder 
    ? `border-2 border-${borderColor} hover:border-${hoverBorderColor} transition-colors duration-300` 
    : '';

  if (user?.avatar_url) {
    return (
      <img
        src={user.avatar_url}
        alt={user.name || 'Avatar'}
        className={`${sizeClass} rounded-full object-cover ${borderClasses} ${className}`}
      />
    );
  }

  return (
    <div 
      className={`
        ${sizeClass} 
        bg-gradient-to-br from-primary-600 to-primary-700 
        rounded-full flex items-center justify-center 
        ${borderClasses} 
        ${className}
      `}
    >
      <span className="text-white font-semibold">
        {getInitials(user)}
      </span>
    </div>
  );
};

export default UserAvatar; 