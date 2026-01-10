import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';

interface Budget {
    _id: string;
    category: string;
    amount: number;
    spent: number;
    remaining: number;
    percentage: number;
}

interface Category {
    _id: string;
    name: string;
}

interface BudgetFormData {
    category: string;
    amount: string | number;
    month: number;
    year: number;
}

const Budgets = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const location = useLocation();

    const [formData, setFormData] = useState<BudgetFormData>({
        category: '',
        amount: '',
        month: new Date().getMonth() + 1,
        year: new Date().getFullYear()
    });

    useEffect(() => {
        fetchBudgets();
        fetchCategories();

        const params = new URLSearchParams(location.search);
        if (params.get('new') === 'true') {
            setShowForm(true);
        }
    }, [location]);

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.categories);
        } catch (error) { console.error(error) }
    }

    const fetchBudgets = async () => {
        try {
            const today = new Date();
            const res = await api.get('/budgets', {
                params: { month: today.getMonth() + 1, year: today.getFullYear() }
            });
            setBudgets(res.data.budgets);
        } catch (error) {
            toast.error('Failed to load budgets');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/budgets', formData);
            toast.success('Budget created');
            setShowForm(false);
            setFormData({ ...formData, amount: '', category: '' });
            fetchBudgets();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to create budget');
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-medium tracking-tight mb-2 text-white">Budgets</h1>
                    <p className="text-white/40">Plan your spending limits for each category.</p>
                </div>
                <button
                    className={showForm ? "btn-secondary" : "btn-primary"}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? 'Cancel' : '+ Create Budget'}
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-8 mb-12">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/50 mb-2 ml-1 uppercase tracking-widest">Category</label>
                            <input
                                list="budget-categories"
                                type="text"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                placeholder="e.g. Groceries"
                                required
                            />
                            <datalist id="budget-categories">
                                {categories.map(c => <option key={c._id} value={c.name} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/50 mb-2 ml-1 uppercase tracking-widest">Monthly Limit</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                required
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full btn-primary !py-[0.875rem]">Save Budget</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-12 text-center text-white/30 italic transition-all animate-pulse">
                        Loading budgets...
                    </div>
                ) : budgets.length === 0 ? (
                    <div className="col-span-full p-12 text-center text-white/30 border-2 border-dashed border-white/5 rounded-3xl italic">
                        No budgets set for this month.
                    </div>
                ) : (
                    budgets.map(budget => {
                        const percent = Math.min(budget.percentage, 100);
                        let colorClass = 'bg-success';
                        let overflowClass = '';

                        if (percent > 85) colorClass = 'bg-orange-400';
                        if (percent >= 100) {
                            colorClass = 'bg-red-400';
                            overflowClass = 'ring-2 ring-red-400/20';
                        }

                        return (
                            <div key={budget._id} className={`glass-card p-8 group transition-all duration-300 hover:translate-y-[-4px] ${overflowClass}`}>
                                <div className="flex justify-between items-start mb-6">
                                    <div>
                                        <h3 className="text-xl font-medium text-white group-hover:text-white/90 transition-colors uppercase tracking-tight">{budget.category}</h3>
                                        <p className="text-white/30 text-sm mt-1">${budget.amount} monthly limit</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[0.7rem] font-medium text-white/40 uppercase tracking-widest mb-1">Spent</p>
                                            <p className={`text-2xl font-semibold tracking-tight ${percent >= 100 ? 'text-red-400' : 'text-white'}`}>
                                                ${budget.spent.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[0.7rem] font-medium text-white/40 uppercase tracking-widest mb-1">Remaining</p>
                                            <p className="text-xl font-medium text-white/60 tracking-tight">
                                                ${Math.max(0, budget.remaining).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative pt-2">
                                        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                        <div className="absolute -top-1 right-0">
                                            <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-sm ${percent >= 100 ? 'bg-red-400/10 text-red-400' : 'bg-white/5 text-white/40'}`}>
                                                {percent}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </Layout>
    );
};

export default Budgets;
