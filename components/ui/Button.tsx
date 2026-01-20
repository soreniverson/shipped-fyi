import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-sand-900 text-white hover:bg-sand-800 focus-visible:ring-sand-900",
        primary: "bg-sand-900 text-white hover:bg-sand-800 focus-visible:ring-sand-900",
        destructive: "bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500",
        outline: "border border-sand-300 bg-white text-sand-900 hover:bg-sand-50 focus-visible:ring-sand-500",
        secondary: "bg-white text-sand-900 border border-sand-300 hover:bg-sand-50 focus-visible:ring-sand-500",
        ghost: "text-sand-600 hover:text-sand-900 hover:bg-sand-100 focus-visible:ring-sand-500",
        link: "text-sand-900 underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-4 py-2 text-sm",
        sm: "h-8 rounded-lg px-3 py-1.5 text-sm",
        md: "h-10 px-4 py-2 text-sm",
        lg: "h-11 rounded-lg px-5 py-2.5 text-base",
        icon: "h-9 w-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
