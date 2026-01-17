import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default:
          "bg-white text-black hover:bg-gray-100 shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)] hover:shadow-[0_0_30px_-5px_rgba(255,255,255,0.6)] border border-transparent hover:-translate-y-0.5 transition-transform duration-300",
        destructive:
          "bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/20 shadow-[0_0_20px_-5px_rgba(239,68,68,0.3)] hover:shadow-[0_0_30px_-5px_rgba(239,68,68,0.5)]",
        outline:
          "border border-white/10 bg-transparent hover:bg-white/5 text-white hover:border-white/30 backdrop-blur-sm shadow-sm hover:shadow-white/5",
        secondary:
          "bg-white/5 text-white hover:bg-white/10 border border-white/5 backdrop-blur-md hover:border-white/20",
        ghost: "hover:bg-white/5 text-gray-400 hover:text-white",
        link: "text-green-400 underline-offset-4 hover:underline",
        spectra: "bg-gradient-to-r from-green-500 to-emerald-400 text-black border-none shadow-[0_0_25px_rgba(34,197,94,0.4)] hover:shadow-[0_0_40px_rgba(34,197,94,0.6)] hover:scale-[1.02] font-extrabold tracking-wide",
        neon: "bg-transparent border border-green-500/50 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.2),inset_0_0_15px_rgba(34,197,94,0.1)] hover:bg-green-500/10 hover:shadow-[0_0_25px_rgba(34,197,94,0.4),inset_0_0_25px_rgba(34,197,94,0.2)] hover:text-green-300",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-lg px-4 text-xs",
        lg: "h-16 rounded-2xl px-10 text-lg",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props} />
  );
})
Button.displayName = "Button"

export { Button, buttonVariants }
