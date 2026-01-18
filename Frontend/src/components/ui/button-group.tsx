import * as React from "react"
import { cn } from "@/lib/utils"

const ButtonGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "flex w-full items-center [&>*:first-child]:rounded-r-none [&>*:last-child]:rounded-l-none [&>*:not(:first-child):not(:last-child)]:rounded-none [&>*:not(:first-child)]:-ml-px",
                    className
                )}
                {...props}
            />
        )
    }
)
ButtonGroup.displayName = "ButtonGroup"

export { ButtonGroup }
