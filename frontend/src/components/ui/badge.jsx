import * as React from "react"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-bold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 uppercase tracking-wide",
  {
    variants: {
      variant: {
        default:
          "border-green-500/20 bg-green-500/10 text-green-400 hover:bg-green-500/20",
        secondary:
          "border-purple-500/20 bg-purple-500/10 text-purple-400 hover:bg-purple-500/20",
        destructive:
          "border-red-500/20 bg-red-500/10 text-red-500 hover:bg-red-500/20",
        outline: "text-gray-400 border-white/10 hover:bg-white/5 hover:text-white",
        dark: "bg-black/50 text-white border-white/10 backdrop-blur-md",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({
  className,
  variant,
  ...props
}) {
  return (<div className={cn(badgeVariants({ variant }), className)} {...props} />);
}

export { Badge, badgeVariants }
