"use client"

import * as React from "react"
import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area"

import { cn } from "@bypass/ui/lib/utils"

interface ScrollAreaProps extends React.ComponentProps<typeof ScrollAreaPrimitive.Root> {
  viewportRef?: React.Ref<HTMLDivElement>
}

const ScrollArea = React.forwardRef<HTMLDivElement, ScrollAreaProps>(
  ({ className, children, viewportRef, ...props }, ref) => {
    const localViewportRef = React.useRef<HTMLDivElement>(null)
    
    React.useImperativeHandle(viewportRef, () => localViewportRef.current!)

    return (
      <ScrollAreaPrimitive.Root
        ref={ref}
        data-slot="scroll-area"
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        <ScrollAreaPrimitive.Viewport
          ref={localViewportRef}
          data-slot="scroll-area-viewport"
          className="h-full w-full overflow-y-auto overflow-x-hidden rounded-[inherit]"
        >
          {children}
        </ScrollAreaPrimitive.Viewport>
        <ScrollAreaPrimitive.Scrollbar
          data-slot="scroll-area-scrollbar"
          orientation="vertical"
          className="flex w-2 touch-none select-none p-0.5 transition-colors data-[hovering]:bg-border/50 data-[scrolling]:bg-border/50"
        >
          <ScrollAreaPrimitive.Thumb
            data-slot="scroll-area-thumb"
            className="relative flex-1 rounded-full bg-border transition-colors data-[hovering]:bg-muted-foreground/50 data-[scrolling]:bg-muted-foreground/50"
          />
        </ScrollAreaPrimitive.Scrollbar>
      </ScrollAreaPrimitive.Root>
    )
  }
)
ScrollArea.displayName = "ScrollArea"

export { ScrollArea }
export type { ScrollAreaProps }
