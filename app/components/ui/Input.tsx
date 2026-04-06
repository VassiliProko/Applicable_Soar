import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  label?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ error = false, label, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="flex flex-col gap-[var(--space-3xs)]">
        {label && (
          <label
            htmlFor={inputId}
            className="type-caption font-medium text-text-secondary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            h-[var(--input-height)] px-[var(--input-px)]
            rounded-[var(--radius-sm)]
            border bg-background text-text-primary type-body
            transition-all duration-[var(--duration-micro)]
            [transition-timing-function:var(--ease-micro)]
            placeholder:text-text-tertiary
            focus:outline-none
            ${
              error
                ? "border-error focus:border-error focus:ring-2 focus:ring-error/24"
                : "border-border hover:border-border-hover focus:border-primary focus:ring-2 focus:ring-[var(--primary-focus-ring)]"
            }
            disabled:opacity-40 disabled:pointer-events-none
            ${className}
          `.trim()}
          {...props}
        />
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
