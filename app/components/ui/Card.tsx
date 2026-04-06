import { HTMLAttributes, forwardRef } from "react";

type CardVariant = "cover" | "top-image" | "inset" | "horizontal";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = "inset", className = "", children, ...props }, ref) => {
    const baseClasses = `
      rounded-[var(--card-outer-radius)]
      shadow-low hover:shadow-mid
      transition-all duration-[var(--duration-micro)]
      [transition-timing-function:var(--ease-micro)]
      hover:-translate-y-px active:scale-[0.99]
      border border-border
      bg-background
    `.trim();

    const variantClasses: Record<CardVariant, string> = {
      cover: "overflow-hidden relative",
      "top-image": "overflow-hidden",
      inset: "p-[var(--card-padding)]",
      horizontal: "p-[var(--card-padding)] flex",
    };

    return (
      <div
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

function CardImage({
  className = "",
  variant = "inset",
  ...props
}: React.ImgHTMLAttributes<HTMLImageElement> & { variant?: CardVariant }) {
  const imageClasses: Record<CardVariant, string> = {
    cover: "absolute inset-0 w-full h-full object-cover",
    "top-image": "w-full aspect-[16/9] object-cover",
    inset: "w-full aspect-[16/9] object-cover rounded-[var(--card-inner-radius)]",
    horizontal:
      "w-[38%] aspect-[3/4] object-cover rounded-[var(--card-inner-radius)] shrink-0",
  };

  return (
    <img
      className={`${imageClasses[variant]} ${className}`}
      {...props}
    />
  );
}

function CardContent({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`flex flex-col gap-[var(--card-content-gap)] ${className}`}
      {...props}
    />
  );
}

function CardOverlay({
  className = "",
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`absolute bottom-0 left-0 right-0 p-[var(--card-padding)] bg-gradient-to-t from-black/60 to-transparent text-white ${className}`}
      {...props}
    />
  );
}

export { Card, CardImage, CardContent, CardOverlay };
export default Card;
