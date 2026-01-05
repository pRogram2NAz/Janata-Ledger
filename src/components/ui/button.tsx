import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-full text-sm font-medium transition-all outline-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-md hover:shadow-lg hover:scale-105",
        success: "bg-gradient-to-r from-emerald-400 to-emerald-500 text-white shadow-md hover:shadow-lg hover:scale-105",
        danger: "bg-gradient-to-r from-red-400 to-red-500 text-white shadow-md hover:shadow-lg hover:scale-105",
        warning: "bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md hover:shadow-lg hover:scale-105",
        dark: "bg-gray-800 text-white shadow-md hover:bg-gray-700 hover:shadow-lg",
        ghost: "hover:bg-gray-100 text-gray-700",
        outline: "border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm",
      },
      size: {
        default: "h-10 px-6 py-2",
        sm: "h-8 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "size-10",
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

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }