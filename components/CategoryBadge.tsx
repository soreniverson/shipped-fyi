import { Category } from '@/lib/supabase/types'
import { Badge } from '@/components/ui/badge'
import { CategoryColor } from '@/lib/category-colors'

interface CategoryBadgeProps {
  category: Category
  size?: 'sm' | 'default'
}

export function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const variant = (category.color || 'gray') as CategoryColor

  return (
    <Badge variant={variant} size={size}>
      {category.name}
    </Badge>
  )
}
