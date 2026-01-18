import { IconType } from 'react-icons';
import { Card, CardContent } from '@/components/ui/card';

interface StatCardProps {
    title: string;
    amount: number;
    icon: IconType;
    color: string;
}

const StatCard = ({ title, amount, icon: Icon, color }: StatCardProps) => {
    return (
        <Card className="p-6 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
            <CardContent className="flex items-center gap-5 p-0">
                <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${color}15`, color: color }}
                >
                    <Icon size={28} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-1">
                        {title}
                    </p>
                    <h2 className="text-2xl font-semibold text-foreground tracking-tight truncate">
                        ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </h2>
                </div>
            </CardContent>
        </Card>
    );
};

export default StatCard;
