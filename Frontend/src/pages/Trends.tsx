import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { BiTrendingUp, BiTrendingDown, BiErrorCircle } from 'react-icons/bi';

interface TrendData {
    name: string;
    amount: number;
}

interface CategoryData {
    name: string;
    value: number;
    [key: string]: any;
}
// ... (rest of the file remains same, targeting specific lines for fixes)
// Wait, replace_file_content is better for contiguous blocks. I'll use multi_replace.


interface PatternData {
    category: string;
    current: number;
    average: number;
    percentIncrease: number;
}

const Trends = () => {
    const [trends, setTrends] = useState<TrendData[]>([]);
    const [categories, setCategories] = useState<CategoryData[]>([]);
    const [patterns, setPatterns] = useState<PatternData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchTrends = async () => {
            try {
                const res = await api.get('/transactions/trends');
                setTrends(res.data.trends);
                setCategories(res.data.highestSpendingCategories);
                setPatterns(res.data.unusualPatterns);
            } catch (error) {
                console.error('Error fetching trends:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrends();
    }, []);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

    return (
        <Layout>
            <div className="mb-12 animate-in fade-in slide-in-from-top-4 duration-500">
                <h1 className="text-4xl font-medium tracking-tight mb-2 text-white">Spending Trends</h1>
                <p className="text-white/40">Analyze your spending habits and patterns over time.</p>
            </div>

            {loading ? (
                <div className="text-white/30 italic text-center py-20">Loading analytics...</div>
            ) : (
                <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500 delay-150">

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Weekly/Monthly Spending Trend */}
                        <div className="glass-card p-8">
                            <h3 className="text-xl font-medium mb-6 text-white flex items-center gap-2">
                                <BiTrendingUp className="text-blue-400" />
                                Spending History
                            </h3>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={trends} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                                        <XAxis
                                            dataKey="name"
                                            stroke="#ffffff40"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                        />
                                        <YAxis
                                            stroke="#ffffff40"
                                            fontSize={12}
                                            tickLine={false}
                                            axisLine={false}
                                            tickFormatter={(value) => `$${value}`}
                                        />
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2335', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff' }}
                                            itemStyle={{ color: '#fff' }}
                                            cursor={{ fill: '#ffffff05' }}
                                        />
                                        <Bar dataKey="amount" fill="#7aa2f7" radius={[4, 4, 0, 0]} barSize={40} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>

                        {/* Highest Spending Categories */}
                        <div className="glass-card p-8">
                            <h3 className="text-xl font-medium mb-6 text-white flex items-center gap-2">
                                <BiTrendingDown className="text-purple-400" />
                                Top Spending Categories
                            </h3>
                            <div className="h-[300px] w-full flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={categories}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {categories.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="rgba(0,0,0,0)" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ backgroundColor: '#1f2335', border: '1px solid #ffffff10', borderRadius: '8px', color: '#fff' }}
                                            formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Amount']}
                                        />
                                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>

                    {/* Unusual Patterns Section */}
                    <div className="glass-card p-8">
                        <h3 className="text-xl font-medium mb-6 text-white flex items-center gap-2">
                            <BiErrorCircle className="text-orange-400" />
                            Unusual Spending Patterns
                        </h3>

                        {patterns.length === 0 ? (
                            <div className="text-center py-10 text-white/30 border border-dashed border-white/5 rounded-2xl bg-white/[0.02]">
                                <p>No unusual spending patterns detected this month. Great job!</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {patterns.map((item, index) => (
                                    <div key={index} className="bg-white/5 border border-red-500/20 p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/40 transition-colors">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/5 rounded-full -mr-8 -mt-8 blur-2xl group-hover:bg-red-500/10 transition-colors"></div>

                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-4">
                                                <span className="px-3 py-1 bg-red-500/10 text-red-300 text-xs font-bold uppercase tracking-wider rounded-full">
                                                    Spending Alert
                                                </span>
                                                <span className="text-red-400 font-bold">+{item.percentIncrease}%</span>
                                            </div>

                                            <h4 className="text-lg font-semibold text-white mb-1">{item.category}</h4>
                                            <p className="text-white/50 text-sm mb-4">
                                                You've spent <span className="text-white font-medium">${item.current.toLocaleString()}</span> this month compared to your average of <span className="text-white font-medium">${Math.round(item.average).toLocaleString()}</span>.
                                            </p>

                                            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                                                <div className="bg-red-500 h-full rounded-full w-full animate-pulse"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default Trends;
