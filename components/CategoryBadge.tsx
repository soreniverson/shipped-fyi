import { Category } from '@/lib/supabase/types'
import { CATEGORY_COLORS } from '@/lib/category-colors'

interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'md'
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const colors = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.gray

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${colors.bg} ${colors.text} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-sm'
      }`}
    >
      {category.name}
    </span>
  )
}
