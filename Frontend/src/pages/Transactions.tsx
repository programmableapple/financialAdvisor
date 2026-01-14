import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { toast } from 'react-hot-toast';
import { BiPlus, BiSearch, BiX, BiTrash } from 'react-icons/bi';

interface Transaction {
    _id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
}

interface Category {
    _id: string;
    name: string;
}

interface TransactionFormData {
    description: string;
    amount: string | number;
    type: 'income' | 'expense';
    category: string;
    date: string;
}

const Transactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState<TransactionFormData>({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        date: new Date().toISOString().split('T')[0]
    });

    const location = useLocation();

    useEffect(() => {
        fetchTransactions();
        fetchCategories();

        const params = new URLSearchParams(location.search);
        if (params.get('new') === 'true') {
            setShowForm(true);
            const type = params.get('type') as 'income' | 'expense';
            if (type === 'income' || type === 'expense') {
                setFormData(prev => ({ ...prev, type }));
            }
        }
    }, [location]);

    const fetchTransactions = async () => {
        try {
            const res = await api.get('/transactions');
            setTransactions(res.data.transactions);
        } catch (error) {
            toast.error('Failed to load transactions');
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(res.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/transactions', formData);
            toast.success('Transaction added');
            setShowForm(false);
            setFormData({
                description: '',
                amount: '',
                type: 'expense',
                category: '',
                date: new Date().toISOString().split('T')[0]
            });
            fetchTransactions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to add transaction');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this transaction?')) return;
        try {
            await api.delete(`/transactions/${id}`);
            toast.success('Transaction deleted');
            setTransactions(prev => prev.filter(t => t._id !== id));
        } catch (error) {
            console.error("Delete error", error);
            toast.error('Failed to delete transaction');
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-medium tracking-tight mb-2 text-white">Transactions</h1>
                    <p className="text-white/40">Track and manage your income and expenses.</p>
                </div>
                <button
                    className={showForm ? "btn-secondary" : "btn-primary"}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? <><BiX size={20} /> Cancel</> : <><BiPlus size={20} /> Add Transaction</>}
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-8 mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2">
                            <label className="block text-[0.8rem] font-medium text-white/50 mb-2 ml-1 uppercase tracking-widest">Description</label>
                            <input
                                type="text"
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. Monthly Rent"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/50 mb-2 ml-1 uppercase tracking-widest">Amount</label>
                            <input
                                type="number"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                placeholder="0.00"
                                step="0.01"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/50 mb-2 ml-1 uppercase tracking-widest">Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-white/20 transition-all appearance-none"
                            >
                                <option value="expense" className="bg-black">Expense</option>
                                <option value="income" className="bg-black">Income</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/50 mb-2 ml-1 uppercase tracking-widest">Category</label>
                            <input
                                list="categories-list"
                                type="text"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                placeholder="e.g. Housing"
                                required
                            />
                            <datalist id="categories-list">
                                {categories.map(c => <option key={c._id} value={c.name} />)}
                            </datalist>
                        </div>
                        <div>
                            <label className="block text-[0.8rem] font-medium text-white/50 mb-2 ml-1 uppercase tracking-widest">Date</label>
                            <input
                                type="date"
                                value={formData.date}
                                onChange={e => setFormData({ ...formData, date: e.target.value })}
                                required
                            />
                        </div>
                        <div className="flex items-end lg:col-span-3">
                            <button type="submit" className="w-full btn-primary !py-4 text-center justify-center">Add Transaction</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="glass-card overflow-hidden">
                <div className="p-6 border-b border-white/5 flex flex-wrap gap-4 items-center justify-between">
                    <div className="relative flex-1 max-w-md">
                        <BiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" />
                        <input
                            type="text"
                            placeholder="Search transactions..."
                            className="w-full bg-white/5 border border-white/5 pl-11 !rounded-full text-sm py-2"
                        />
                    </div>
                    <div className="flex gap-2">
                        <button className="px-4 py-2 rounded-full border border-white/5 text-sm font-medium text-white/60 hover:text-white transition-colors">
                            All
                        </button>
                        <button className="px-4 py-2 rounded-full border border-white/5 text-sm font-medium text-white/60 hover:text-white transition-colors">
                            Income
                        </button>
                        <button className="px-4 py-2 rounded-full border border-white/5 text-sm font-medium text-white/60 hover:text-white transition-colors">
                            Expense
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-white/5">
                                <th className="px-8 py-4 text-[0.7rem] font-medium text-white/40 uppercase tracking-widest">Date</th>
                                <th className="px-8 py-4 text-[0.7rem] font-medium text-white/40 uppercase tracking-widest">Description</th>
                                <th className="px-8 py-4 text-[0.7rem] font-medium text-white/40 uppercase tracking-widest">Category</th>
                                <th className="px-8 py-4 text-right text-[0.7rem] font-medium text-white/40 uppercase tracking-widest">Amount</th>
                                <th className="px-8 py-4 text-right text-[0.7rem] font-medium text-white/40 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-white/30 italic">Loading transactions...</td>
                                </tr>
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-12 text-center text-white/30 italic">No transactions found.</td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                                        <td className="px-8 py-5 text-white/60 text-sm whitespace-nowrap">
                                            {new Date(t.date).toLocaleDateString()}
                                        </td>
                                        <td className="px-8 py-5 text-white font-medium">{t.description}</td>
                                        <td className="px-8 py-5">
                                            <span className="px-3 py-1 rounded-full bg-white/5 text-white/60 text-[0.7rem] font-medium uppercase tracking-wider">
                                                {t.category}
                                            </span>
                                        </td>
                                        <td className={`px-8 py-5 text-right font-semibold ${t.type === 'income' ? 'text-[#9ece6a]' : 'text-[#f7768e]'}`}>
                                            {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <button
                                                onClick={() => handleDelete(t._id)}
                                                className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-red-400 transition-colors"
                                                title="Delete transaction"
                                            >
                                                <BiTrash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </Layout>
    );
};

export default Transactions;
