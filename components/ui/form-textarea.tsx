import * as React from "react"
import { Textarea, TextareaProps } from "./textarea"
import { Label } from "./label"
import { cn } from "@/lib/utils"

interface FormTextareaProps extends TextareaProps {
  label?: string
  error?: string
}

const FormTextarea = React.forwardRef<HTMLTextAreaElement, FormTextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={id} className="mb-1 block">
            {label}
          </Label>
        )}
        <Textarea
          ref={ref}
          id={id}
          className={cn(
            error && "border-red-300",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)
FormTextarea.displayName = "FormTextarea"

// Also export as Textarea for backward compatibility
export { FormTextarea, FormTextarea as Textarea }
