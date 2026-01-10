import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { BiTrendingUp, BiTrendingDown, BiWallet } from 'react-icons/bi';

interface CategoryStats {
    expense: number;
    transactions: number;
}

interface Stats {
    totalIncome: number;
    totalExpenses: number;
    balance: number;
    categoryBreakdown: Record<string, CategoryStats>;
}

const Dashboard = () => {
    const location = useLocation();
    const [loading, setLoading] = useState<boolean>(true);
    const [stats, setStats] = useState<Stats>({
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        categoryBreakdown: {}
    });

    useEffect(() => {
        fetchStats();
    }, [location]);

    const fetchStats = async () => {
        try {
            const today = new Date();
            const res = await api.get('/transactions/stats', {
                params: { month: today.getMonth() + 1, year: today.getFullYear() }
            });
            setStats(res.data);
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <Layout>
            <div style={{ color: '#fff' }}>Loading dashboard...</div>
        </Layout>
    );

    return (
        <Layout>
            <div className="mb-12">
                <h1 className="text-4xl font-medium tracking-tight mb-2 text-white">Overview</h1>
                <p className="text-white/40">Here's what's happening with your finances this month.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                <StatCard
                    title="Total Income"
                    amount={stats.totalIncome}
                    icon={BiTrendingUp}
                    color="#9ece6a"
                />
                <StatCard
                    title="Total Expenses"
                    amount={stats.totalExpenses}
                    icon={BiTrendingDown}
                    color="#f7768e"
                />
                <StatCard
                    title="Total Balance"
                    amount={stats.balance}
                    icon={BiWallet}
                    color="#7aa2f7"
                />
            </div>

            <div className="flex flex-wrap gap-4 mb-12">
                <Link to="/transactions?new=true&type=expense" className="btn-primary">
                    <BiTrendingDown size={20} /> Add Expense
                </Link>
                <Link to="/transactions?new=true&type=income" className="btn-primary" style={{ background: '#9ece6a' }}>
                    <BiTrendingUp size={20} /> Add Income
                </Link>
                <Link to="/budgets?new=true" className="btn-secondary">
                    <BiWallet size={20} /> Set Budget
                </Link>
            </div>

            <div className="glass-card p-8">
                <h3 className="text-xl font-medium mb-8 text-white">Expense Breakdown</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(stats.categoryBreakdown || {}).map(([category, data]) => (
                        <div key={category} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                            <p className="text-white/40 text-[0.8rem] font-medium uppercase tracking-widest mb-2">{category}</p>
                            <p className="text-xl font-semibold text-white tracking-tight">${data.expense.toLocaleString()}</p>
                        </div>
                    ))}
                    {Object.keys(stats.categoryBreakdown || {}).length === 0 && (
                        <p className="text-white/30 italic">No expenses recorded this month.</p>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default Dashboard;