import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "~/_lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-regular ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-indigo-950 dark:focus-visible:ring-indigo-300",
  {
    variants: {
      variant: {
        default: "bg-indigo-500 text-indigo-50 hover:bg-indigo-500/90 dark:bg-indigo-50 dark:text-indigo-900 dark:hover:bg-indigo-50/90",
        destructive:
          "bg-red-500 text-indigo-50 hover:bg-red-500/90 dark:bg-red-900 dark:text-indigo-50 dark:hover:bg-red-900/90",
        outline:
          "border border-indigo-200 bg-white hover:bg-indigo-100 hover:text-indigo-900 dark:border-indigo-800 dark:bg-indigo-950 dark:hover:bg-indigo-800 dark:hover:text-indigo-50",
        secondary:
          "bg-indigo-100 text-indigo-900 hover:bg-indigo-100/80 dark:bg-indigo-800 dark:text-indigo-50 dark:hover:bg-indigo-800/80",
        ghost: "hover:bg-indigo-100 hover:text-indigo-500 dark:hover:bg-indigo-800 dark:hover:text-indigo-50",
        link: "text-indigo-900 underline-offset-4 hover:underline dark:text-indigo-50",
      },
      size: {
        default: "min-h-10 px-4 py-2",
        sm: "min-h-9 rounded-md px-3",
        lg: "min-h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
