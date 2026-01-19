export const CATEGORY_COLORS = {
  gray: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200' },
  red: { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' },
  green: { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-700', border: 'border-purple-200' },
  pink: { bg: 'bg-pink-100', text: 'text-pink-700', border: 'border-pink-200' },
} as const

export type CategoryColor = keyof typeof CATEGORY_COLORS
