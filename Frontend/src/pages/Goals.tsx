import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { BiPlus, BiTargetLock, BiTrash } from 'react-icons/bi';
import { differenceInMonths, format } from 'date-fns';

interface Goal {
    _id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    targetDate: string;
    color: string;
}

const Goals = () => {
    const [goals, setGoals] = useState<Goal[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        targetAmount: '',
        targetDate: '',
        color: '#3b82f6'
    });

    // Add Funds State
    const [addingFunds, setAddingFunds] = useState<string | null>(null); // Goal ID
    const [fundAmount, setFundAmount] = useState<string>('');

    useEffect(() => {
        fetchGoals();
    }, []);

    const fetchGoals = async () => {
        try {
            const res = await api.get('/goals');
            setGoals(res.data.goals);
        } catch (error) {
            console.error(error);
            toast.error('Failed to load goals');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.post('/goals', formData);
            toast.success('Goal set successfully!');
            setShowForm(false);
            setFormData({ name: '', targetAmount: '', targetDate: '', color: '#3b82f6' });
            fetchGoals();
        } catch (error) {
            toast.error('Failed to create goal');
        }
    };

    const handleAddFunds = async (goalId: string) => {
        try {
            await api.put(`/goals/${goalId}`, { addAmount: fundAmount });
            toast.success('Funds added!');
            setAddingFunds(null);
            setFundAmount('');
            fetchGoals();
        } catch (error) {
            toast.error('Failed to add funds');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this goal?')) return;
        try {
            await api.delete(`/goals/${id}`);
            toast.success('Goal deleted');
            setGoals(goals.filter(g => g._id !== id));
        } catch (error) {
            toast.error('Failed to delete goal');
        }
    };

    const calculateMonthlySavings = (goal: Goal) => {
        const remaining = goal.targetAmount - goal.currentAmount;
        if (remaining <= 0) return 0;

        const today = new Date();
        const target = new Date(goal.targetDate);
        const months = differenceInMonths(target, today);

        if (months <= 0) return remaining; // Due now or overdue
        return Math.ceil(remaining / months);
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-medium tracking-tight mb-2 text-white">Financial Goals</h1>
                    <p className="text-white/40">Set targets and track your savings progress.</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${showForm ? 'bg-white/5 text-white' : 'btn-primary'}`}
                >
                    {showForm ? 'Cancel' : <><BiPlus size={20} /> New Goal</>}
                </button>
            </div>

            {showForm && (
                <div className="glass-card p-8 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-medium text-white mb-6">Set New Goal</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Goal Name</label>
                            <input
                                type="text"
                                required
                                placeholder="e.g. New Car"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Target Amount</label>
                            <input
                                type="number"
                                required
                                placeholder="10000"
                                value={formData.targetAmount}
                                onChange={e => setFormData({ ...formData, targetAmount: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-white/50 mb-2">Target Date</label>
                            <input
                                type="date"
                                required
                                value={formData.targetDate}
                                onChange={e => setFormData({ ...formData, targetDate: e.target.value })}
                                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                            />
                        </div>
                        <div className="flex items-end">
                            <button type="submit" className="w-full btn-primary py-3">Create Goal</button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <div className="text-white/30 italic text-center py-20">Loading goals...</div>
            ) : goals.length === 0 ? (
                <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-3xl">
                    <BiTargetLock size={48} className="mx-auto text-white/20 mb-4" />
                    <p className="text-white/40">No goals set yet. Start saving today!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => {
                        const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                        const monthlyNeeded = calculateMonthlySavings(goal);

                        return (
                            <div key={goal._id} className="glass-card p-6 relative group">
                                <button
                                    onClick={() => handleDelete(goal._id)}
                                    className="absolute top-4 right-4 p-2 text-white/20 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                                >
                                    <BiTrash />
                                </button>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                                        <BiTargetLock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white">{goal.name}</h3>
                                        <p className="text-white/40 text-sm">Target: {format(new Date(goal.targetDate), 'MMM yyyy')}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/60">Progress</span>
                                        <span className="text-white font-medium">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-blue-500 transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs pt-1">
                                        <span className="text-white/40">${goal.currentAmount.toLocaleString()} saved</span>
                                        <span className="text-white/40">of ${goal.targetAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="bg-white/5 rounded-xl p-4 mb-6">
                                    <p className="text-xs uppercase tracking-widest text-white/40 mb-1">Monthly Savings Needed</p>
                                    <p className="text-2xl font-medium text-white">
                                        ${monthlyNeeded.toLocaleString()}
                                        <span className="text-sm text-white/30 font-normal"> /mo</span>
                                    </p>
                                </div>

                                {addingFunds === goal._id ? (
                                    <div className="flex gap-2 animate-in fade-in zoom-in-95">
                                        <input
                                            autoFocus
                                            type="number"
                                            placeholder="Amount"
                                            value={fundAmount}
                                            onChange={e => setFundAmount(e.target.value)}
                                            className="flex-1 bg-white/10 border border-white/10 rounded-lg px-3 text-sm text-white focus:outline-none"
                                        />
                                        <button
                                            onClick={() => handleAddFunds(goal._id)}
                                            disabled={!fundAmount}
                                            className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-3 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={() => setAddingFunds(null)}
                                            className="bg-white/5 hover:bg-white/10 text-white/60 px-3 rounded-lg text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setAddingFunds(goal._id)}
                                        className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-sm text-white/80 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <BiPlus /> Add Funds manually
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </Layout>
    );
};

export default Goals;
