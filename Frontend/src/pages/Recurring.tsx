import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { BiPlus, BiTimeFive, BiTrash, BiCalendarEvent, BiCheckCircle } from 'react-icons/bi';
import { format, addMonths } from 'date-fns';

interface RecurringItem {
    _id: string;
    name: string;
    amount: number;
    category: string;
    frequency: string;
    nextDueDate: string;
}

interface Suggestion {
    name: string;
    amount: number;
    category: string;
    frequency: string;
    confidence: string;
}

const Recurring = () => {
    const [recurring, setRecurring] = useState<RecurringItem[]>([]);
    const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        category: '',
        frequency: 'monthly',
        nextDueDate: format(new Date(), 'yyyy-MM-dd')
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [recurringRes, suggestRes] = await Promise.all([
                api.get('/recurring'),
                api.get('/recurring/detect')
            ]);
            setRecurring(recurringRes.data.recurring);
            setSuggestions(suggestRes.data.suggestions);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load subscriptions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/recurring', formData);
            toast.success('Subscription added');
            setShowForm(false);
            setFormData({
                name: '',
                amount: '',
                category: '',
                frequency: 'monthly',
                nextDueDate: format(new Date(), 'yyyy-MM-dd')
            });
            fetchData();
        } catch (error) {
            toast.error('Failed to add subscription');
        }
    };

    const handleAddSuggestion = async (s: Suggestion) => {
        try {
            await api.post('/recurring', {
                name: s.name,
                amount: s.amount,
                category: s.category,
                frequency: s.frequency,
                nextDueDate: format(addMonths(new Date(), 1), 'yyyy-MM-dd') // Default to next month
            });
            toast.success(`${s.name} added to subscriptions`);
            fetchData();
        } catch (error) {
            toast.error('Failed to add suggestion');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Stop tracking this subscription?')) return;
        try {
            await api.delete(`/recurring/${id}`);
            toast.success('Subscription removed');
            setRecurring(recurring.filter(r => r._id !== id));
        } catch (error) {
            toast.error('Failed to remove subscription');
        }
    };

    const totalMonthly = recurring.reduce((sum, item) => sum + item.amount, 0);

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-medium tracking-tight mb-2 text-white">Recurring Expenses</h1>
                    <p className="text-white/40">Manage subscriptions and predicted bills.</p>
                </div>
                <div className="flex gap-4 items-center">
                    <div className="text-right hidden md:block px-4 border-r border-white/10">
                        <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Total Monthly</p>
                        <p className="text-xl font-bold text-white">${totalMonthly.toLocaleString()}</p>
                    </div>
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${showForm ? 'bg-white/5 text-white' : 'btn-primary'}`}
                    >
                        {showForm ? 'Cancel' : <><BiPlus size={20} /> Add Bill</>}
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="glass-card p-8 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-medium text-white mb-6">Add Recurring Bill</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                        <div className="lg:col-span-2">
                            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. Netflix"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Amount</label>
                            <input
                                type="number"
                                required
                                placeholder="15.00"
                                value={formData.amount}
                                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Category</label>
                            <input
                                type="text"
                                required
                                placeholder="Entertainment"
                                value={formData.category}
                                onChange={e => setFormData({ ...formData, category: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Next Due</label>
                            <input
                                type="date"
                                required
                                value={formData.nextDueDate}
                                onChange={e => setFormData({ ...formData, nextDueDate: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="lg:col-span-5 flex justify-end">
                            <button type="submit" className="btn-primary py-3 px-8">Save Subscription</button>
                        </div>
                    </form>
                </div>
            )}

            {/* Suggestions */}
            {suggestions.length > 0 && (
                <div className="mb-12">
                    <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                        <BiCheckCircle className="text-green-400" />
                        Detected Subscriptions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {suggestions.map((s, idx) => (
                            <div key={idx} className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/20 p-6 rounded-2xl flex justify-between items-center group hover:border-green-500/40 transition-colors">
                                <div>
                                    <h4 className="font-bold text-white">{s.name}</h4>
                                    <p className="text-white/60 text-sm">~${s.amount}/mo • {s.category}</p>
                                </div>
                                <button
                                    onClick={() => handleAddSuggestion(s)}
                                    className="px-4 py-2 bg-green-500 hover:bg-green-400 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-green-500/20"
                                >
                                    Confirm
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Active List */}
            <div className="space-y-4">
                <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
                    <BiCalendarEvent className="text-blue-400" />
                    Active Subscriptions
                </h3>

                {loading ? (
                    <div className="text-white/30 italic">Loading subscriptions...</div>
                ) : recurring.length === 0 ? (
                    <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-3xl">
                        <BiTimeFive size={32} className="mx-auto text-white/20 mb-3" />
                        <p className="text-white/40">No active subscriptions found.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {recurring.map(item => (
                            <div key={item._id} className="glass-card p-6 flex flex-col md:flex-row justify-between items-center gap-4 group">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl font-bold text-white">
                                        {item.name[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-bold text-white">{item.name}</h4>
                                        <p className="text-white/40 text-sm">{item.category} • {item.frequency}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8 w-full md:w-auto justify-between md:justify-end">
                                    <div className="text-right">
                                        <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Next Bill</p>
                                        <p className="text-white font-medium">{format(new Date(item.nextDueDate), 'MMM dd, yyyy')}</p>
                                    </div>
                                    <div className="text-right w-24">
                                        <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Amount</p>
                                        <p className="text-xl font-bold text-white">${item.amount}</p>
                                    </div>
                                    <button
                                        onClick={() => handleDelete(item._id)}
                                        className="p-3 text-white/20 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                                    >
                                        <BiTrash size={20} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default Recurring;
