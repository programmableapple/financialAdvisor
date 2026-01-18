import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import api from '../api/axios';
import Layout from '../components/Layout';
import { toast } from 'sonner';
import { BiPlus, BiSearch, BiX, BiTrash, BiPencil } from 'react-icons/bi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AmountInput } from '@/components/ui/amount-input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { SpinnerEmpty } from '../components/spinner-empty';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { IconSearch, IconCalendarClock, IconHistory } from '@tabler/icons-react';
import { NaturalDatePicker } from '@/components/ui/natural-date-picker';
import { cn } from '@/lib/utils';
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
} from '@/components/ui/alert-dialog';

interface Transaction {
    _id: string;
    description: string;
    amount: number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    status: 'completed' | 'upcoming';
}

interface Category {
    _id: string;
    name: string;
}

interface RecurringItem {
    _id: string;
    name: string;
}

interface TransactionFormData {
    description: string;
    amount: string | number;
    type: 'income' | 'expense';
    category: string;
    date: string;
    status?: 'completed' | 'upcoming';
}

const Transactions = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [deleteId, setDeleteId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
    const [activeTab, setActiveTab] = useState<'completed' | 'upcoming'>('completed');

    // Recurring Sync State
    const [recurringItems, setRecurringItems] = useState<RecurringItem[]>([]);
    const [matchedRecurring, setMatchedRecurring] = useState<RecurringItem | null>(null);
    const [syncRecurring, setSyncRecurring] = useState(false);

    const [formData, setFormData] = useState<TransactionFormData>({
        description: '',
        amount: '',
        type: 'expense',
        category: '',
        date: (() => {
            const d = new Date();
            const year = d.getFullYear();
            const month = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        })(),
        status: 'completed'
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
        fetchRecurringItems();
    }, [location, activeTab]);

    const fetchRecurringItems = async () => {
        try {
            const res = await api.get('/recurring');
            setRecurringItems(res.data.recurring);
        } catch (error) {
            console.error('Error fetching recurring items:', error);
        }
    };

    const fetchTransactions = async () => {
        setLoading(true);
        try {
            const res = await api.get('/transactions', {
                params: { status: activeTab }
            });
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
            if (editingId) {
                await api.put(`/transactions/${editingId}`, formData);
                toast.success('Transaction updated successfully');
            } else {
                // Determine status based on date
                const [year, month, day] = formData.date.split('-').map(Number);
                const transactionDate = new Date(year, month - 1, day); // Local time
                const today = new Date();
                today.setHours(0, 0, 0, 0); // Local time start of day

                const status = transactionDate > today ? 'upcoming' : 'completed';

                await api.post('/transactions', { ...formData, status });
                toast.success(status === 'upcoming' ? 'Transaction scheduled successfully' : 'Transaction added successfully');
            }
            setShowForm(false);
            setEditingId(null);
            setFormData({
                description: '',
                amount: '',
                type: 'expense',
                category: '',
                date: (() => {
                    const d = new Date();
                    const year = d.getFullYear();
                    const month = String(d.getMonth() + 1).padStart(2, '0');
                    const day = String(d.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                })(),
                status: 'completed'
            });
            fetchTransactions();
        } catch (error: any) {
            toast.error(error.response?.data?.message || `Failed to ${editingId ? 'update' : 'add'} transaction`);
        }
    };

    const handleEdit = (transaction: Transaction) => {
        setFormData({
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category,
            date: (() => {
                const d = new Date(transaction.date);
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            })(),
            status: transaction.status
        });
        setEditingId(transaction._id);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleCancel = () => {
        setShowForm(false);
        setEditingId(null);
        setFormData({
            description: '',
            amount: '',
            type: 'expense',
            category: '',
            date: (() => {
                const d = new Date();
                const year = d.getFullYear();
                const month = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            })(),
            status: 'completed'
        });
    };

    // Find matching recurring item when preparing for deletion
    useEffect(() => {
        if (deleteId) {
            const transaction = transactions.find(t => t._id === deleteId);
            if (transaction) {
                const match = recurringItems.find(r =>
                    r.name.toLowerCase() === transaction.description.toLowerCase()
                );
                setMatchedRecurring(match || null);
            }
        } else {
            setMatchedRecurring(null);
            setSyncRecurring(false);
        }
    }, [deleteId, transactions, recurringItems]);

    const handleDelete = async () => {
        if (!deleteId) return;
        try {
            await api.delete(`/transactions/${deleteId}`);

            // If sync is enabled and a match exists, delete the recurring rule too
            if (syncRecurring && matchedRecurring) {
                await api.delete(`/recurring/${matchedRecurring._id}`);
                toast.success('Transaction and recurring rule removed');
            } else {
                toast.success('Transaction deleted successfully');
            }

            setDeleteId(null);
            fetchTransactions();
            if (syncRecurring) fetchRecurringItems();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to delete transaction');
        }
    };

    // Filter and search transactions
    const filteredTransactions = transactions
        .filter(t => filterType === 'all' || t.type === filterType)
        .filter(t =>
            t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.category.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (
        <Layout>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-12">
                <div>
                    <h1 className="heading-xl mb-2 text-foreground">Transactions</h1>
                    <p className="text-muted-foreground">Track and manage your income and expenses.</p>
                </div>
                <Button
                    onClick={() => {
                        if (showForm) {
                            handleCancel();
                        } else {
                            setShowForm(true);
                        }
                    }}
                    variant={showForm ? "outline" : "default"}
                    size="lg"
                    className="gap-2"
                >
                    {showForm ? (
                        <>
                            <BiX size={20} /> Cancel
                        </>
                    ) : (
                        <>
                            <BiPlus size={20} /> Add Transaction
                        </>
                    )}
                </Button>
            </div>

            {/* Tabs for History and Upcoming */}
            <div className="flex gap-1 bg-muted p-1 rounded-xl mb-8 w-fit">
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab('completed')}
                    className={cn(
                        "rounded-lg gap-2 px-6",
                        activeTab === 'completed' && "bg-background shadow-sm text-foreground hover:bg-background"
                    )}
                >
                    <IconHistory size={18} />
                    Active
                </Button>
                <Button
                    variant="ghost"
                    onClick={() => setActiveTab('upcoming')}
                    className={cn(
                        "rounded-lg gap-2 px-6",
                        activeTab === 'upcoming' && "bg-background shadow-sm text-foreground hover:bg-background"
                    )}
                >
                    <IconCalendarClock size={18} />
                    Upcoming
                </Button>
            </div>

            {/* Transaction Form */}
            {showForm && (
                <Card className="mb-12">
                    <CardHeader>
                        <CardTitle className="text-foreground">
                            {editingId ? 'Edit Transaction' : 'New Transaction'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="lg:col-span-2 space-y-2">
                                <label htmlFor="description" className="form-label">Description</label>
                                <Input
                                    id="description"
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="e.g. Monthly Rent"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="amount" className="form-label">Amount</label>
                                <AmountInput
                                    id="amount"
                                    required
                                    value={formData.amount}
                                    onChange={(val) => setFormData({ ...formData, amount: val })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="type" className="form-label">Type</label>
                                <select
                                    id="type"
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value as 'income' | 'expense' })}
                                    className="w-full h-9 bg-background border border-input rounded-md px-3 py-1 text-foreground focus:outline-none focus:ring-1 focus:ring-ring transition-all"
                                >
                                    <option value="expense">Expense</option>
                                    <option value="income">Income</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label htmlFor="category" className="form-label">Category</label>
                                <Input
                                    id="category"
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

                            <NaturalDatePicker
                                id="date"
                                label="Schedule Date"
                                date={formData.date ? new Date(formData.date) : undefined}
                                setDate={(newDate) => {
                                    if (newDate) {
                                        const year = newDate.getFullYear();
                                        const month = String(newDate.getMonth() + 1).padStart(2, '0');
                                        const day = String(newDate.getDate()).padStart(2, '0');
                                        setFormData({
                                            ...formData,
                                            date: `${year}-${month}-${day}`
                                        });
                                    }
                                }}
                                placeholder="When is this happening?"
                            />

                            <div className="flex items-end lg:col-span-3">
                                <Button type="submit" size="lg" className="w-full md:w-auto">
                                    {editingId ? 'Save Changes' : 'Add Transaction'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            {/* Transactions Table */}
            <Card>
                <CardHeader className="border-b border-border">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                        <div className="relative flex-1 max-w-md w-full">
                            <BiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                            <Input
                                type="text"
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 rounded-full"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterType === 'all' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setFilterType('all')}
                                className="rounded-full"
                            >
                                All
                            </Button>
                            <Button
                                variant={filterType === 'income' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setFilterType('income')}
                                className="rounded-full"
                            >
                                Income
                            </Button>
                            <Button
                                variant={filterType === 'expense' ? 'default' : 'ghost'}
                                size="sm"
                                onClick={() => setFilterType('expense')}
                                className="rounded-full"
                            >
                                Expense
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow className="border-border hover:bg-transparent">
                                    <TableHead className="text-muted-foreground">Date</TableHead>
                                    <TableHead className="text-muted-foreground">Description</TableHead>
                                    <TableHead className="text-muted-foreground">Category</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Amount</TableHead>
                                    <TableHead className="text-right text-muted-foreground">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={5}>
                                            <SpinnerEmpty />
                                        </TableCell>
                                    </TableRow>
                                ) : filteredTransactions.length === 0 ? (
                                    <TableRow className="border-border hover:bg-transparent">
                                        <TableCell colSpan={5} className="py-12">
                                            <Empty>
                                                <EmptyHeader>
                                                    <EmptyMedia variant="icon">
                                                        <IconSearch className="size-6" />
                                                    </EmptyMedia>
                                                    <EmptyTitle>
                                                        {searchQuery || filterType !== 'all'
                                                            ? 'No matching transactions'
                                                            : 'No transactions yet'}
                                                    </EmptyTitle>
                                                    <EmptyDescription>
                                                        {searchQuery || filterType !== 'all'
                                                            ? 'Try adjusting your search or filters to find what you\'re looking for.'
                                                            : 'Start tracking your finances by adding your first transaction above.'}
                                                    </EmptyDescription>
                                                </EmptyHeader>
                                                {!searchQuery && filterType === 'all' && (
                                                    <EmptyContent>
                                                        <Button
                                                            onClick={() => setShowForm(true)}
                                                            className="gap-2"
                                                        >
                                                            <BiPlus size={18} /> Add Your First Transaction
                                                        </Button>
                                                    </EmptyContent>
                                                )}
                                            </Empty>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredTransactions.map((t) => (
                                        <TableRow key={t._id} className="border-border hover:bg-muted/50">
                                            <TableCell className="text-muted-foreground text-sm whitespace-nowrap">
                                                {new Date(t.date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="text-foreground font-medium">{t.description}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-muted text-muted-foreground border-border">
                                                    {t.category}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className={`text-right font-semibold ${t.type === 'income' ? 'text-income' : 'text-expense'}`}>
                                                {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => handleEdit(t)}
                                                        className="text-muted-foreground hover:text-primary"
                                                    >
                                                        <BiPencil size={18} />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon-sm"
                                                        onClick={() => setDeleteId(t._id)}
                                                        className="text-muted-foreground hover:text-destructive"
                                                    >
                                                        <BiTrash size={18} />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={!!deleteId} onOpenChange={(open: boolean) => !open && setDeleteId(null)}>
                <AlertDialogContent className="border-border">
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-foreground">Delete Transaction</AlertDialogTitle>
                        <AlertDialogDescription className="text-muted-foreground">
                            Are you sure you want to delete this transaction? This action cannot be undone.
                        </AlertDialogDescription>

                        {matchedRecurring && (
                            <div className="pt-2">
                                <Label className="flex items-start gap-3 rounded-lg border border-border p-3 cursor-pointer hover:bg-accent/50 transition-colors has-[[aria-checked=true]]:border-primary has-[[aria-checked=true]]:bg-primary/5">
                                    <Checkbox
                                        id="sync-recurring"
                                        checked={syncRecurring}
                                        onCheckedChange={(checked) => setSyncRecurring(!!checked)}
                                        className="mt-0.5"
                                    />
                                    <div className="grid gap-1.5 font-normal">
                                        <p className="text-sm leading-none font-medium text-foreground">
                                            Also stop tracking this subscription
                                        </p>
                                        <p className="text-muted-foreground text-xs leading-relaxed">
                                            This will permanently remove '{matchedRecurring.name}' from your Recurring page.
                                        </p>
                                    </div>
                                </Label>
                            </div>
                        )}
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel className="bg-muted text-foreground border-border hover:bg-accent">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </Layout>
    );
};

export default Transactions;
