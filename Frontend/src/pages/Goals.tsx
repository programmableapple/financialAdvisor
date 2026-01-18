import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import api from '../api/axios';
import { toast } from 'sonner';
import { BiPlus, BiTargetLock, BiTrash, BiX } from 'react-icons/bi';
import { differenceInMonths, format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { SpinnerEmpty } from '../components/spinner-empty';
import { DatePicker } from '@/components/ui/date-picker';
import { IconTarget } from '@tabler/icons-react';
import {
    Empty,
    EmptyContent,
    EmptyDescription,
    EmptyHeader,
    EmptyMedia,
    EmptyTitle,
} from "@/components/ui/empty";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface Goal {
    _id: string;
    name: string;
    targetAmount: number;
    currentAmount: number;
    currency: string; // Added currency
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
        currency: '$', // Added currency
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
            setFormData({ name: '', targetAmount: '', currency: '$', targetDate: '', color: '#3b82f6' });
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
                    <h1 className="text-4xl font-medium tracking-tight mb-2 text-foreground">Financial Goals</h1>
                    <p className="text-muted-foreground">Set targets and track your savings progress.</p>
                </div>
                <Button
                    onClick={() => setShowForm(!showForm)}
                    variant={showForm ? "outline" : "default"}
                    size="lg"
                    className="gap-2"
                >
                    {showForm ? (
                        <><BiX size={20} /> Cancel</>
                    ) : (
                        <><BiPlus size={20} /> New Goal</>
                    )}
                </Button>
            </div>

            {showForm && (
                <div className="glass-card p-8 mb-8 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-xl font-medium text-foreground mb-6">Set New Goal</h3>
                    <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="goal-name" className="form-label">Goal Name</label>
                            <Input
                                id="goal-name"
                                type="text"
                                required
                                placeholder="e.g. New Car"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="target-amount" className="form-label">Target Amount</label>
                            <AmountInput
                                id="target-amount"
                                required
                                value={formData.targetAmount}
                                onChange={(val) => setFormData({ ...formData, targetAmount: val })}
                                currency={formData.currency}
                                onCurrencyChange={(val) => setFormData({ ...formData, currency: val })}
                            />
                        </div>
                        <DatePicker
                            id="target-date"
                            label="Target Date"
                            date={formData.targetDate ? new Date(formData.targetDate) : undefined}
                            setDate={(newDate) => {
                                if (newDate) {
                                    const year = newDate.getFullYear();
                                    const month = String(newDate.getMonth() + 1).padStart(2, '0');
                                    const day = String(newDate.getDate()).padStart(2, '0');
                                    setFormData({
                                        ...formData,
                                        targetDate: `${year}-${month}-${day}`
                                    });
                                } else {
                                    setFormData({ ...formData, targetDate: '' });
                                }
                            }}
                        />
                        <div className="flex items-end">
                            <Button type="submit" size="lg" className="w-full">Create Goal</Button>
                        </div>
                    </form>
                </div>
            )}

            {loading ? (
                <SpinnerEmpty />
            ) : goals.length === 0 ? (
                <Empty>
                    <EmptyHeader>
                        <EmptyMedia variant="icon">
                            <IconTarget className="size-6" />
                        </EmptyMedia>
                        <EmptyTitle>No financial goals yet</EmptyTitle>
                        <EmptyDescription>
                            Set your first savings goal and track your progress towards achieving it.
                        </EmptyDescription>
                    </EmptyHeader>
                    <EmptyContent>
                        <Button onClick={() => setShowForm(true)} size="lg" className="gap-2">
                            <BiPlus size={20} /> Set Your First Goal
                        </Button>
                    </EmptyContent>
                </Empty>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => {
                        const progress = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
                        const monthlyNeeded = calculateMonthlySavings(goal);

                        return (
                            <div key={goal._id} className="glass-card p-6 relative group">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <button
                                            className="absolute top-4 right-4 p-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                                        >
                                            <BiTrash />
                                        </button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone. This will permanently delete your goal for {goal.name}.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => handleDelete(goal._id)}>
                                                Delete
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                        <BiTargetLock size={24} />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{goal.name}</h3>
                                        <p className="text-muted-foreground text-sm">Target: {format(new Date(goal.targetDate), 'MMM yyyy')}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-6">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-muted-foreground">Progress</span>
                                        <span className="text-foreground font-medium">{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        ></div>
                                    </div>
                                    <div className="flex justify-between text-xs pt-1">
                                        <span className="text-muted-foreground">{goal.currency || '$'}{goal.currentAmount.toLocaleString()} saved</span>
                                        <span className="text-muted-foreground">of {goal.currency || '$'}{goal.targetAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="bg-muted rounded-xl p-4 mb-6">
                                    <p className="text-xs uppercase tracking-widest text-muted-foreground mb-1">Monthly Savings Needed</p>
                                    <p className="text-2xl font-medium text-foreground">
                                        {goal.currency || '$'}{monthlyNeeded.toLocaleString()}
                                        <span className="text-sm text-muted-foreground font-normal"> /mo</span>
                                    </p>
                                </div>

                                {addingFunds === goal._id ? (
                                    <div className="flex gap-2 animate-in fade-in zoom-in-95">
                                        <AmountInput
                                            autoFocus
                                            value={fundAmount}
                                            onChange={(val) => setFundAmount(val)}
                                            className="flex-1"
                                            placeholder="Amount"
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
                                            className="bg-muted hover:bg-accent text-muted-foreground px-3 rounded-lg text-sm"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setAddingFunds(goal._id)}
                                        className="w-full py-2 bg-muted hover:bg-accent border border-border rounded-lg text-sm text-muted-foreground transition-colors flex items-center justify-center gap-2"
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
