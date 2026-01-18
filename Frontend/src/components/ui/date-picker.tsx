"use client"

import * as React from "react"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
    date?: Date;
    setDate: (date: Date | undefined) => void;
    label?: string;
    id?: string;
    className?: string;
    placeholder?: string;
}

function formatDate(date: Date | undefined) {
    if (!date) {
        return ""
    }

    return date.toLocaleDateString("en-US", {
        day: "2-digit",
        month: "long",
        year: "numeric",
    })
}

function isValidDate(date: Date | undefined) {
    if (!date) {
        return false
    }
    return !isNaN(date.getTime())
}

export function DatePicker({ date, setDate, label, id, className, placeholder }: DatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [month, setMonth] = React.useState<Date | undefined>(date || new Date())
    const [inputValue, setInputValue] = React.useState(formatDate(date))

    // Sync inputValue when date prop changes externally
    React.useEffect(() => {
        setInputValue(formatDate(date))
        if (date) setMonth(date)
    }, [date])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setInputValue(val)
        const parsedDate = new Date(val)
        if (isValidDate(parsedDate)) {
            setDate(parsedDate)
            setMonth(parsedDate)
        }
    }

    return (
        <div className={cn("flex flex-col gap-2", className)}>
            {label && (
                <Label htmlFor={id} className="px-1 text-xs uppercase tracking-widest text-muted-foreground">
                    {label}
                </Label>
            )}
            <div className="relative flex gap-2">
                <Input
                    id={id}
                    value={inputValue}
                    placeholder={placeholder || "Select date..."}
                    className="bg-background pr-10 border-border focus:ring-primary h-12"
                    onChange={handleInputChange}
                    onKeyDown={(e) => {
                        if (e.key === "ArrowDown") {
                            e.preventDefault()
                            setOpen(true)
                        }
                    }}
                />
                <Popover open={open} onOpenChange={setOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            id={`${id}-picker`}
                            variant="ghost"
                            className="absolute top-1/2 right-2 size-8 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-transparent"
                        >
                            <CalendarIcon className="size-4" />
                            <span className="sr-only">Select date</span>
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent
                        className="w-auto overflow-hidden p-0 border-border"
                        align="end"
                        alignOffset={-8}
                        sideOffset={10}
                    >
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            month={month}
                            onMonthChange={setMonth}
                            onSelect={(newDate) => {
                                setDate(newDate)
                                setInputValue(formatDate(newDate))
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
        </div>
    )
}
