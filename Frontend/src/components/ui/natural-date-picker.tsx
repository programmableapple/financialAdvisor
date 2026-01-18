"use client"

import * as React from "react"
import { parseDate } from "chrono-node"
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

interface NaturalDatePickerProps {
    date: Date | undefined;
    setDate: (date: Date | undefined) => void;
    label?: string;
    id?: string;
    placeholder?: string;
    className?: string;
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

export function NaturalDatePicker({ date, setDate, label, id, placeholder, className }: NaturalDatePickerProps) {
    const [open, setOpen] = React.useState(false)
    const [value, setValue] = React.useState(formatDate(date))
    const [month, setMonth] = React.useState<Date | undefined>(date || new Date())

    React.useEffect(() => {
        setValue(formatDate(date))
        if (date) setMonth(date)
    }, [date])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value
        setValue(val)
        const parsedDate = parseDate(val)
        if (parsedDate) {
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
                    value={value}
                    placeholder={placeholder || "Tomorrow or next week"}
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
                    <PopoverContent className="w-auto overflow-hidden p-0 border-border" align="end">
                        <Calendar
                            mode="single"
                            selected={date}
                            captionLayout="dropdown"
                            month={month}
                            onMonthChange={setMonth}
                            onSelect={(newDate) => {
                                setDate(newDate)
                                setValue(formatDate(newDate))
                                setOpen(false)
                            }}
                        />
                    </PopoverContent>
                </Popover>
            </div>
            {date && (() => {
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                const checkDate = new Date(date);
                checkDate.setHours(0, 0, 0, 0);
                return checkDate > today;
            })() && (
                    <div className="text-muted-foreground px-1 text-[10px] uppercase tracking-tighter">
                        Scheduled for: <span className="font-bold text-primary">{formatDate(date)}</span>
                    </div>
                )}
        </div>
    )
}
