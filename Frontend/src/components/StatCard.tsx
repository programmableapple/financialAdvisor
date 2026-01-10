import { IconType } from 'react-icons';

interface StatCardProps {
    title: string;
    amount: number;
    icon: IconType;
    color: string;
}

const StatCard = ({ title, amount, icon: Icon, color }: StatCardProps) => {
    return (
        <div className="glass-card p-6 flex items-center gap-5 translate-y-0 hover:-translate-y-1 transition-all duration-300">
            <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${color}15`, color: color }}
            >
                <Icon size={28} />
            </div>
            <div>
                <p className="text-white/40 text-[0.8rem] font-medium uppercase tracking-widest mb-1">{title}</p>
                <h2 className="text-2xl font-semibold text-white tracking-tight">
                    ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h2>
            </div>
        </div>
    );
};

export default StatCard;
