import type { Priority } from '@/lib/types';

interface PriorityDotProps {
  priority: Priority;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-2 h-2',
  md: 'w-3 h-3',
  lg: 'w-4 h-4',
};

const colorClasses: Record<Priority, string> = {
  1: 'bg-red-500',     // High priority
  2: 'bg-yellow-500',  // Medium priority
  3: 'bg-gray-400',    // Low priority
};

const glowClasses: Record<Priority, string> = {
  1: 'shadow-red-500/50',
  2: 'shadow-yellow-500/50',
  3: 'shadow-gray-400/50',
};

export default function PriorityDot({ priority, size = 'md' }: PriorityDotProps) {
  return (
    <div
      className={`
        ${sizeClasses[size]}
        ${colorClasses[priority]}
        ${priority === 1 ? `shadow-lg ${glowClasses[priority]} animate-pulse` : ''}
        rounded-full
        inline-block
      `}
      title={`Priority ${priority}`}
    />
  );
}
