import * as React from "react"
import { Input as BaseInput, InputProps } from "./input"
import { Label } from "./label"
import { cn } from "@/lib/utils"

interface FormInputProps extends InputProps {
  label?: string
  error?: string
}

const FormInput = React.forwardRef<HTMLInputElement, FormInputProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <Label htmlFor={id} className="mb-1 block">
            {label}
          </Label>
        )}
        <BaseInput
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
FormInput.displayName = "FormInput"

// Also export as Input for backward compatibility
export { FormInput, FormInput as Input }
