import * as React from "react";
import { cn } from "@/lib/utils";

export interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  color?: "inherit" | "default" | "primary" | "secondary" | "error";
  size?: "small" | "medium" | "large";
  edge?: "start" | "end" | false;
  component?: React.ElementType;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      className,
      color = "default",
      size = "medium",
      edge,
      component,
      ...props
    },
    ref,
  ) => {
    const Comp = (component ?? "button") as React.ElementType;
    const sizeClass =
      size === "small"
        ? "h-8 w-8"
        : size === "large"
          ? "h-12 w-12"
          : "h-10 w-10";
    const colorClass =
      color === "primary"
        ? "text-[var(--color-primary)] hover:bg-[color:color-mix(in_oklab,var(--color-primary)_15%,transparent)]"
        : color === "secondary"
          ? "text-[var(--color-secondary)] hover:bg-[color:color-mix(in_oklab,var(--color-secondary)_15%,transparent)]"
          : color === "error"
            ? "text-[var(--color-error)] hover:bg-[color:color-mix(in_oklab,var(--color-error)_15%,transparent)]"
            : "text-[var(--color-text-secondary)] hover:bg-white/5 hover:text-[var(--color-text-primary)]";

    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]",
          "disabled:pointer-events-none disabled:opacity-50",
          sizeClass,
          colorClass,
          edge === "start" && "-ml-1",
          edge === "end" && "-mr-1",
          className,
        )}
        {...props}
      />
    );
  },
);

IconButton.displayName = "IconButton";
