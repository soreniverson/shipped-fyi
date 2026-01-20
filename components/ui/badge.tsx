import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-sand-100 text-sand-700",
        secondary: "bg-sand-100 text-sand-600",
        destructive: "bg-red-100 text-red-700",
        outline: "border border-sand-200 text-sand-700",
        // Category colors
        gray: "bg-gray-100 text-gray-700",
        red: "bg-red-100 text-red-700",
        orange: "bg-orange-100 text-orange-700",
        blue: "bg-blue-100 text-blue-700",
        green: "bg-green-100 text-green-700",
        purple: "bg-purple-100 text-purple-700",
        pink: "bg-pink-100 text-pink-700",
        // Status colors
        considering: "bg-amber-100 text-amber-700",
        planned: "bg-violet-100 text-violet-700",
        in_progress: "bg-blue-100 text-blue-700",
        shipped: "bg-emerald-100 text-emerald-700",
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant, size }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
