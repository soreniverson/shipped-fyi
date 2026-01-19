'use client'

import { Category } from '@/lib/supabase/types'
import { CATEGORY_COLORS } from '@/lib/category-colors'

interface CategoryFilterProps {
  categories: Category[]
  selectedCategoryId: string | null
  onSelect: (categoryId: string | null) => void
}

export function CategoryFilter({ categories, selectedCategoryId, onSelect }: CategoryFilterProps) {
  if (categories.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelect(null)}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
          selectedCategoryId === null
            ? 'bg-sand-900 text-white'
            : 'bg-sand-100 text-sand-600 hover:bg-sand-200'
        }`}
      >
        All
      </button>
      {categories.map((category) => {
        const colors = CATEGORY_COLORS[category.color] || CATEGORY_COLORS.gray
        const isSelected = selectedCategoryId === category.id

        return (
          <button
            key={category.id}
            onClick={() => onSelect(category.id)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              isSelected
                ? `${colors.bg} ${colors.text} ring-2 ring-offset-1 ring-current`
                : `${colors.bg} ${colors.text} hover:opacity-80`
            }`}
          >
            {category.name}
          </button>
        )
      })}
    </div>
  )
}
