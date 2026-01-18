import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { BiPlus, BiX, BiTrash, BiPencil } from 'react-icons/bi';
import { SpinnerEmpty } from '../components/spinner-empty';
import { IconWallet } from '@tabler/icons-react';
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

interface Budget {
    id: string;
    _id?: string;
    category: string;
    amount: number;
    currency: string;
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
    currency: string;
    month: number;
    year: number;
}

const Budgets = () => {
    const [budgets, setBudgets] = useState<Budget[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [showForm, setShowForm] = useState<boolean>(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const location = useLocation();

    const [formData, setFormData] = useState<BudgetFormData>({
        category: '',
        amount: '',
        currency: '$',
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
            if (editingId) {
                await api.put(`/budgets/${editingId}`, formData);
                toast.success('Budget updated');
            } else {
                await api.post('/budgets', formData);
                toast.success('Budget created');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({ ...formData, amount: '', category: '' });
            fetchBudgets();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to save budget');
        }
    };

    const handleEdit = (budget: Budget) => {
        setFormData({
            category: budget.category,
            amount: budget.amount,
            currency: budget.currency,
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear()
        });
        setEditingId(budget._id!);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (id: string) => {
        try {
            await api.delete(`/budgets/${id}`);
            setBudgets(prev => prev.filter(b => b._id !== id));
            toast.success('Budget deleted');
        } catch (error) {
            toast.error('Failed to delete budget');
        }
    };

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h1 className="text-4xl font-medium tracking-tight mb-2 text-foreground">Budgets</h1>
                    <p className="text-muted-foreground">Plan your spending limits for each category.</p>
                </div>
                <Button
                    variant={showForm ? "outline" : "default"}
                    size="lg"
                    onClick={() => {
                        setShowForm(!showForm);
                        if (showForm) {
                            setEditingId(null);
                            setFormData({ ...formData, amount: '', category: '' });
                        }
                    }}
                    className="gap-2"
                >
                    {showForm ? (
                        <><BiX size={20} /> Cancel</>
                    ) : (
                        <><BiPlus size={20} /> Create Budget</>
                    )}
                </Button>
            </div>

            {showForm && (
                <div className="glass-card p-8 mb-12">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                            <label htmlFor="category" className="form-label">Category</label>
                            <Input
                                id="category"
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
                        <div className="space-y-2">
                            <label htmlFor="amount" className="form-label">Monthly Limit</label>
                            <AmountInput
                                id="amount"
                                required
                                value={formData.amount}
                                onChange={(val) => setFormData({ ...formData, amount: val })}
                                currency={formData.currency}
                                onCurrencyChange={(val) => setFormData({ ...formData, currency: val })}
                            />
                        </div>
                        <div className="flex items-end">
                            <Button type="submit" size="lg" className="w-full">{editingId ? 'Update Budget' : 'Save Budget'}</Button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <SpinnerEmpty />
                ) : budgets.length === 0 ? (
                    <div className="col-span-full">
                        <Empty>
                            <EmptyHeader>
                                <EmptyMedia variant="icon">
                                    <IconWallet className="size-6" />
                                </EmptyMedia>
                                <EmptyTitle>No budgets yet</EmptyTitle>
                                <EmptyDescription>
                                    Start managing your finances by creating your first budget and track your spending limits.
                                </EmptyDescription>
                            </EmptyHeader>
                            <EmptyContent>
                                <Button onClick={() => setShowForm(true)} size="lg" className="gap-2">
                                    <BiPlus size={20} /> Create Your First Budget
                                </Button>
                            </EmptyContent>
                        </Empty>
                    </div>
                ) : (
                    budgets.map(budget => {
                        const percent = Math.round(Math.min(budget.percentage || 0, 100));
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
                                        <h3 className="text-xl font-medium text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{budget.category}</h3>
                                        <p className="text-muted-foreground text-sm mt-1">${budget.amount} monthly limit</p>
                                    </div>
                                    <div className="flex gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-muted-foreground hover:text-primary opacity-0 group-hover:opacity-100 transition-all font-bold"
                                            onClick={() => handleEdit(budget)}
                                        >
                                            <BiPencil size={18} />
                                        </Button>
                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all font-bold"
                                                >
                                                    <BiTrash size={18} />
                                                </Button>
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                        This action cannot be undone. This will permanently delete your budget for {budget.category}.
                                                    </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(budget._id!)}>
                                                        Delete
                                                    </AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[0.7rem] font-medium text-muted-foreground uppercase tracking-widest mb-1">Spent</p>
                                            <p className={`text-2xl font-semibold tracking-tight ${percent >= 100 ? 'text-destructive' : 'text-foreground'}`}>
                                                {budget.currency || '$'}{budget.spent.toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[0.7rem] font-medium text-muted-foreground uppercase tracking-widest mb-1">Remaining</p>
                                            <p className="text-sm font-medium text-muted-foreground whitespace-nowrap">
                                                Spent {budget.currency || '$'}{budget.spent.toLocaleString()} <span className="text-muted-foreground/50">/ {budget.currency || '$'}{budget.amount.toLocaleString()}</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="relative pt-2">
                                        <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-1000 ease-out ${colorClass}`}
                                                style={{ width: `${percent}%` }}
                                            ></div>
                                        </div>
                                        <div className="absolute -top-1 right-0">
                                            <span className={`text-[0.65rem] font-bold px-1.5 py-0.5 rounded-sm ${percent >= 100 ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
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
        </Layout >
    );
};

export default Budgets;
