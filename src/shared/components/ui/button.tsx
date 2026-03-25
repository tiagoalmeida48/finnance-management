import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium",
    "transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  {
    variants: {
      variant: {
        default:
          "bg-[var(--color-primary)] text-[var(--color-background)] hover:bg-[var(--color-primary-light)]",
        destructive: "bg-[var(--color-error)] text-white hover:brightness-110",
        outline:
          "border border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]",
        secondary:
          "bg-[var(--color-surface)] text-[var(--color-text-primary)] hover:bg-[var(--color-card-hover)]",
        ghost:
          "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]",
        link: "text-[var(--color-primary)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
      fullWidth: {
        true: "w-full",
        false: "",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      fullWidth: false,
    },
  },
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    Omit<VariantProps<typeof buttonVariants>, "variant" | "size"> {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link"
    | "contained"
    | "outlined"
    | "text";
  color?: "primary" | "secondary" | "error" | "inherit";
  size?: "sm" | "default" | "lg" | "icon" | "small" | "medium" | "large";
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  component?: React.ElementType;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      color,
      size,
      fullWidth,
      startIcon,
      endIcon,
      component,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = (component ?? "button") as React.ElementType;

    const resolvedVariant = (() => {
      if (variant === "contained")
        return color === "error" ? "destructive" : "default";
      if (variant === "outlined") return "outline";
      if (variant === "text") return "ghost";
      if (variant) return variant;
      if (color === "error") return "destructive";
      if (color === "secondary") return "secondary";
      return "default";
    })();

    const resolvedSize = (() => {
      if (size === "small") return "sm";
      if (size === "medium") return "default";
      if (size === "large") return "lg";
      return size ?? "default";
    })();

    return (
      <Comp
        className={cn(
          buttonVariants({
            variant: resolvedVariant,
            size: resolvedSize,
            fullWidth,
          }),
          className,
        )}
        ref={ref}
        {...props}
      >
        {startIcon ? (
          <span className="inline-flex items-center">{startIcon}</span>
        ) : null}
        {children}
        {endIcon ? (
          <span className="inline-flex items-center">{endIcon}</span>
        ) : null}
      </Comp>
    );
  },
);
Button.displayName = "Button";

export { Button };
