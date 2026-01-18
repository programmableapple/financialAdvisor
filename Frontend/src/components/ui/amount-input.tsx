import * as React from "react"
import { ButtonGroup } from "@/components/ui/button-group"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from "@/components/ui/select"

const CURRENCIES = [
    { value: "$", label: "US Dollar (USD)" },
    { value: "€", label: "Euro (EUR)" },
    { value: "£", label: "British Pound (GBP)" },
    { value: "¥", label: "Japanese Yen (JPY)" },
    { value: "₹", label: "Indian Rupee (INR)" },
    { value: "A$", label: "Australian Dollar (AUD)" },
    { value: "C$", label: "Canadian Dollar (CAD)" },
    { value: "Fr", label: "Swiss Franc (CHF)" },
    { value: "¥", label: "Chinese Yuan (CNY)" },
    { value: "kr", label: "Swedish Krona (SEK)" },
    { value: "NZ$", label: "New Zealand Dollar (NZD)" },
    { value: "S$", label: "Singapore Dollar (SGD)" },
    { value: "HK$", label: "Hong Kong Dollar (HKD)" },
    { value: "kr", label: "Norwegian Krone (NOK)" },
    { value: "₩", label: "South Korean Won (KRW)" },
    { value: "₺", label: "Turkish Lira (TRY)" },
    { value: "₽", label: "Russian Ruble (RUB)" },
    { value: "R$", label: "Brazilian Real (BRL)" },
    { value: "R", label: "South African Rand (ZAR)" },
]

interface AmountInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
    value: string | number;
    onChange: (value: string) => void;
    currency?: string;
    onCurrencyChange?: (currency: string) => void;
}

export function AmountInput({ value, onChange, currency = "$", onCurrencyChange, className, ...props }: AmountInputProps) {
    const handleCurrencyChange = (val: string) => {
        if (onCurrencyChange) {
            onCurrencyChange(val);
        }
    };

    return (
        <div className={className}>
            <ButtonGroup>
                <Select value={currency} onValueChange={handleCurrencyChange}>
                    <SelectTrigger className="w-[80px] font-mono focus:ring-0 focus:ring-offset-0 z-10 relative">{currency}</SelectTrigger>
                    <SelectContent className="min-w-24">
                        {CURRENCIES.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                                {c.value}{" "}
                                <span className="text-muted-foreground">{c.label}</span>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Input
                    {...props}
                    type="number"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className="flex-1 focus-visible:ring-0 focus-visible:ring-offset-0 relative z-0"
                    placeholder="0.00"
                />
            </ButtonGroup>
        </div>
    )
}
