import { TextareaHTMLAttributes, forwardRef } from 'react'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-medium text-sand-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={id}
          className={`w-full px-4 py-2.5 rounded-lg border bg-white text-sand-900 placeholder:text-sand-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none ${
            error ? 'border-red-300' : 'border-sand-300'
          } ${className}`}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
