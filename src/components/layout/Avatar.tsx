interface AvatarProps {
  src?: string | null;
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-12 h-12 text-sm',
  lg: 'w-20 h-20 text-lg',
  xl: 'w-28 h-28 text-2xl',
};

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function getColorFromName(name: string): string {
  const colors = [
    'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200',
    'bg-purple-200 dark:bg-purple-800 text-purple-700 dark:text-purple-200',
    'bg-blue-200 dark:bg-blue-800 text-blue-700 dark:text-blue-200',
    'bg-green-200 dark:bg-green-800 text-green-700 dark:text-green-200',
    'bg-amber-200 dark:bg-amber-800 text-amber-700 dark:text-amber-200',
    'bg-rose-200 dark:bg-rose-800 text-rose-700 dark:text-rose-200',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function Avatar({ src, name, size = 'md', className = '' }: AvatarProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} ${getColorFromName(name)} rounded-full flex items-center justify-center font-semibold ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}
