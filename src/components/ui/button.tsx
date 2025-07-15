import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "../../lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95",
  {
    variants: {
      variant: {
        default: "bg-white text-black hover:bg-[#9945FF] hover:text-white focus-visible:ring-[#9945FF]",
        secondary: "bg-gray-800 text-white hover:bg-gray-700 focus-visible:ring-white",
        outline:
          "border-2 border-[#9945FF] bg-transparent text-white hover:bg-[#9945FF] hover:text-white focus-visible:ring-white",
        ghost: "bg-transparent text-white hover:bg-gray-800 hover:text-white focus-visible:ring-[#9945FF]",
        dark: "bg-white text-black hover:bg-gray-200 focus-visible:ring-[#9945FF]",
        destructive: "bg-[#9945FF] text-white hover:bg-[#7b2cbf] hover:text-white focus-visible:ring-red-500",
        link: "text-white underline-offset-4 hover:underline hover:text-[#9945FF] focus-visible:ring-[#9945FF]",
      },
      size: {
        default: "h-11 px-6 py-2",
        sm: "h-9 rounded-lg px-4 text-xs",
        lg: "h-14 rounded-xl px-10 text-base",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
  },
)
Button.displayName = "Button"

// eslint-disable-next-line react-refresh/only-export-components
export { Button, buttonVariants }
