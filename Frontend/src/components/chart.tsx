"use client"
import { Bar, BarChart, CartesianGrid, LineChart, XAxis, YAxis } from "recharts"
import { ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import {
    ChartContainer,
    type ChartConfig,
} from "@/components/ui/chart"

interface SpendingHistoryChartProps {
    data: {
        name: string;
        amount: number;
    }[];
}

const chartConfig = {
    amount: {
        label: "Amount spent",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function SpendingHistoryChart({ data }: SpendingHistoryChartProps) {
    return (
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
            <BarChart accessibilityLayer data={data}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                <XAxis
                    dataKey="name"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                    tickFormatter={(value) => value}
                />
                <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tickFormatter={(value) => `$${value}`}
                />
                <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                <ChartLegend content={<ChartLegendContent nameKey="browser" />} />
                <LineChart accessibilityLayer />
                <Bar dataKey="amount" fill="var(--color-amount)" radius={[4, 4, 0, 0]} barSize={40} />
            </BarChart>
        </ChartContainer>
    )
}