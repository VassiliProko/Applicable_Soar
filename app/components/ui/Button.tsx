"use client";

import { ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-surface-dark text-white hover:opacity-80 active:opacity-90",
  secondary:
    "bg-transparent border border-border text-primary hover:border-border-hover active:bg-primary-tint",
  ghost:
    "bg-transparent text-primary hover:bg-primary-tint active:bg-primary-tint/60",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-[var(--btn-height-sm)] px-3 text-sm",
  md: "h-[var(--btn-height)] px-4 text-base",
  lg: "h-[var(--btn-height-lg)] px-6 text-base",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`
          inline-flex items-center justify-center gap-2
          rounded-[var(--radius-sm)] font-medium
          transition-all duration-[var(--duration-base)]
          [transition-timing-function:var(--ease-enter)]
          active:scale-[0.97]
          focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary
          disabled:opacity-40 disabled:pointer-events-none
          cursor-pointer
          ${variantClasses[variant]}
          ${sizeClasses[size]}
          ${className}
        `.trim()}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export default Button;
