import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-14 w-full rounded-2xl border border-white/5 bg-white/5 px-4 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-white/20 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-green-500/50 focus-visible:border-green-500/50 disabled:cursor-not-allowed disabled:opacity-50 backdrop-blur-xl transition-all text-white hover:bg-white/10 hover:border-white/10 shadow-sm",
        className
      )}
      ref={ref}
      {...props} />
  );
})
Input.displayName = "Input"

export { Input }
