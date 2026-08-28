import { cn } from '../lib/utils'

interface ProgressBarProps {
  value: number      // 0-100
  color?: string
  size?: 'sm' | 'md' | 'lg'
  showLabel?: boolean
  label?: string
  className?: string
  animated?: boolean
}

export default function ProgressBar({
  value,
  color,
  size = 'md',
  showLabel = false,
  label,
  className,
  animated = true,
}: ProgressBarProps) {
  const heights = { sm: 'h-1', md: 'h-1.5', lg: 'h-2' }
  const clampedValue = Math.min(100, Math.max(0, value))

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5 text-xs font-body">
          {label && <span className="text-muted-foreground font-medium">{label}</span>}
          {showLabel && (
            <span className="font-heading font-semibold text-foreground ml-auto">{clampedValue}%</span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            !color && (clampedValue === 100 ? 'bg-emerald-500' : 'bg-primary'),
            animated && 'transition-all duration-500 ease-out'
          )}
          style={{
            width: `${clampedValue}%`,
            ...(color ? { backgroundColor: color } : {}),
          }}
          role="progressbar"
          aria-valuenow={clampedValue}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
