import { forwardRef, createElement, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface TextProps extends HTMLAttributes<HTMLElement> {
  as?: "p" | "span" | "small" | "strong" | "em" | "label";
}

export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { as = "p", className, ...props },
  ref,
) {
  return createElement(as, { ref, className: cn(className), ...props });
});
