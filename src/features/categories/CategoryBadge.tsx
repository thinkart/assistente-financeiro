import { cn } from '@/lib/utils'
import { categoryBadgeClassName } from './colors'

interface CategoryBadgeProps {
  categoryId: string
  name: string
  className?: string
}

export function CategoryBadge({
  categoryId,
  name,
  className,
}: CategoryBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
        categoryBadgeClassName(categoryId),
        className,
      )}
    >
      {name}
    </span>
  )
}
