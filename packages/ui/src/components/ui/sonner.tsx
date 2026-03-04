"use client"

import { Toaster as HotToaster, type ToasterProps } from "react-hot-toast"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <HotToaster
      position="top-right"
      toastOptions={{
        className: "bg-popover text-popover-foreground border border-border rounded-[var(--radius)]",
      }}
      {...props}
    />
  )
}

export { Toaster }
