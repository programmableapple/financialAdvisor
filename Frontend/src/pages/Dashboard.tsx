import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import { BiTrendingUp, BiTrendingDown, BiWallet } from 'react-icons/bi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { SpinnerEmpty } from '../components/spinner-empty';

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

    return (
        <Layout>
            <div className="mb-12">
                <h1 className="heading-xl mb-2 text-foreground">Overview</h1>
                <p className="text-muted-foreground">Here's what's happening with your finances this month.</p>
            </div>

            {/* Stats Cards with Loading State */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {loading ? (
                    <SpinnerEmpty />
                ) : (
                    <>
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
                    </>
                )}
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-4 mb-12">
                <Button asChild size="lg" className="gap-2">
                    <Link to="/transactions?new=true&type=expense">
                        <BiTrendingDown size={20} />
                        Add Expense
                    </Link>
                </Button>
                <Button asChild size="lg" className="gap-2 bg-success hover:bg-success/90">
                    <Link to="/transactions?new=true&type=income">
                        <BiTrendingUp size={20} />
                        Add Income
                    </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2">
                    <Link to="/budgets?new=true">
                        <BiWallet size={20} />
                        Set Budget
                    </Link>
                </Button>
            </div>

            {/* Category Breakdown */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-xl font-medium text-foreground">Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="space-y-2">
                                    <Skeleton className="h-4 w-20" />
                                    <Skeleton className="h-6 w-28" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {Object.entries(stats.categoryBreakdown || {}).map(([category, data]) => (
                                <div
                                    key={category}
                                    className="bg-muted p-5 rounded-2xl border border-border hover:border-primary/20 transition-colors cursor-pointer"
                                >
                                    <p className="text-muted-foreground text-xs font-medium uppercase tracking-widest mb-2">
                                        {category}
                                    </p>
                                    <p className="text-xl font-semibold text-foreground tracking-tight">
                                        ${data.expense.toLocaleString()}
                                    </p>
                                    <p className="text-muted-foreground text-xs mt-1">
                                        {data.transactions} {data.transactions === 1 ? 'transaction' : 'transactions'}
                                    </p>
                                </div>
                            ))}
                            {Object.keys(stats.categoryBreakdown || {}).length === 0 && (
                                <div className="col-span-full text-center py-8 text-muted-foreground italic border-2 border-dashed border-border rounded-2xl">
                                    No expenses recorded this month. Start tracking your spending!
                                </div>
                            )}
                        </div>
                    )}
                </CardContent>
            </Card>
        </Layout>
    );
};

export default Dashboard;
