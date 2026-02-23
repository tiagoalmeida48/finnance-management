import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type RowProps = HTMLAttributes<HTMLDivElement>;

export function Row({ className, ...props }: RowProps) {
  return <div className={cn("flex", className)} {...props} />;
}
