import { cn } from '../lib/utils'

interface ProgressBarProps {
  value: number      // 0-100
  color?: string     // Tailwind gradient or custom
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
  const heights = { sm: 'h-2', md: 'h-3', lg: 'h-4' }
  const clampedValue = Math.min(100, Math.max(0, value))

  const fillColor = color ?? (
    clampedValue >= 80 ? 'linear-gradient(90deg, #059669, #10B981)' :
    clampedValue >= 50 ? 'linear-gradient(90deg, #7C3AED, #8B5CF6)' :
    clampedValue >= 25 ? 'linear-gradient(90deg, #D97706, #F59E0B)' :
    'linear-gradient(90deg, #DC2626, #EF4444)'
  )

  return (
    <div className={cn('w-full', className)}>
      {(showLabel || label) && (
        <div className="flex items-center justify-between mb-1.5">
          {label && <span className="text-xs font-semibold text-muted-foreground font-body">{label}</span>}
          {showLabel && (
            <span className="text-xs font-bold text-foreground font-heading ml-auto">{clampedValue}%</span>
          )}
        </div>
      )}
      <div className={cn('progress-bar-track', heights[size])}>
        <div
          className={cn('h-full rounded-full', animated && 'transition-all duration-700 ease-out')}
          style={{
            width: `${clampedValue}%`,
            background: fillColor,
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
