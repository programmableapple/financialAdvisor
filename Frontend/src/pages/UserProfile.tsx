import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import api from '../api/axios';
import { BiWallet, BiUser, BiEnvelope, BiCalendar, BiEdit } from 'react-icons/bi';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
} from '@/components/ui/avatar';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

const UserProfile = () => {
    const { user, updateUser } = useAuth();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [passwords, setPasswords] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [updating, setUpdating] = useState(false);
    const [profileData, setProfileData] = useState({
        name: user?.name || '',
        email: user?.email || ''
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileData({
                name: user.name || '',
                email: user.email || ''
            });
        }
    }, [user]);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                const res = await api.get('/transactions/stats');
                setBalance(res.data.balance);
            } catch (error) {
                console.error('Error fetching balance:', error);
                toast.error('Failed to load financial data');
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, []);

    const handleUpdateProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        try {
            const res = await api.put('/auth/profile', profileData);
            updateUser(res.data.user);
            toast.success('Profile updated successfully');
            setIsDialogOpen(false);
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to update profile');
        } finally {
            setUpdating(false);
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return toast.error('New passwords do not match');
        }

        if (passwords.newPassword.length < 6) {
            return toast.error('Password must be at least 6 characters');
        }

        setUpdating(true);
        try {
            await api.post('/auth/change-password', {
                oldPassword: passwords.oldPassword,
                newPassword: passwords.newPassword
            });
            toast.success('Password changed successfully');
            setIsChangingPassword(false);
            setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setUpdating(false);
        }
    };

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Unknown';

    return (
        <Layout>
            <div className="mb-12">
                <h1 className="text-4xl font-medium tracking-tight mb-2 text-foreground">My Profile</h1>
                <p className="text-muted-foreground">Manage your personal information and view account summary.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Details Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BiUser size={150} />
                        </div>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                            <Avatar className="w-32 h-32 rounded-full shadow-2xl border-none">
                                <AvatarImage src={user?.avatarUrl} alt={user?.name} />
                                <AvatarFallback className="bg-gradient-to-br from-primary to-primary/80 text-4xl font-bold text-white uppercase">
                                    {user?.name?.[0] || 'U'}
                                </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-foreground">{user?.name}</h2>

                                </div>

                                <div className="space-y-2 pt-4 border-t border-border">
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground">
                                        <BiEnvelope className="text-primary" size={20} />
                                        <span>{user?.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-muted-foreground">
                                        <BiCalendar className="text-purple-400" size={20} />
                                        <span>Member since {memberSince}</span>
                                    </div>
                                </div>
                            </div>

                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="secondary" className="hidden md:flex items-center gap-2">
                                        <BiEdit size={16} />
                                        Edit Profile
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <form onSubmit={handleUpdateProfile}>
                                        <DialogHeader>
                                            <DialogTitle>Edit profile</DialogTitle>
                                            <DialogDescription>
                                                Make changes to your profile here. Click save when you&apos;re done.
                                            </DialogDescription>
                                        </DialogHeader>
                                        <div className="grid gap-4 py-4">
                                            <div className="grid gap-3">
                                                <Label htmlFor="name">Name</Label>
                                                <Input
                                                    id="name"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                    className="col-span-3"
                                                    required
                                                />
                                            </div>
                                            <div className="grid gap-3">
                                                <Label htmlFor="email">Email</Label>
                                                <Input
                                                    id="email"
                                                    type="email"
                                                    value={profileData.email}
                                                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                    className="col-span-3"
                                                    required
                                                />
                                            </div>
                                        </div>
                                        <DialogFooter>
                                            <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                            <Button type="submit" disabled={updating}>
                                                {updating ? 'Saving...' : 'Save changes'}
                                            </Button>
                                        </DialogFooter>
                                    </form>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>

                    {/* Account Settings */}
                    <div className="glass-card p-8">
                        <h3 className="text-xl font-medium mb-6 text-foreground">Account Settings</h3>
                        <div className="space-y-4">
                            <Card>
                                <CardHeader className="flex-row items-center justify-between pb-4">
                                    <div className="space-y-1">
                                        <CardTitle className="text-lg">Security</CardTitle>
                                        <CardDescription>Change your password</CardDescription>
                                    </div>
                                    {!isChangingPassword && (
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setIsChangingPassword(true)}
                                        >
                                            Update
                                        </Button>
                                    )}
                                </CardHeader>

                                {isChangingPassword && (
                                    <CardContent className="pt-0 border-t border-border mt-4">
                                        <form onSubmit={handlePasswordChange} className="space-y-4 pt-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2 space-y-1.5">
                                                    <Label htmlFor="oldPassword">Current Password</Label>
                                                    <Input
                                                        id="oldPassword"
                                                        type="password"
                                                        required
                                                        value={passwords.oldPassword}
                                                        onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                                                        placeholder="Enter current password"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="newPassword">New Password</Label>
                                                    <Input
                                                        id="newPassword"
                                                        type="password"
                                                        required
                                                        value={passwords.newPassword}
                                                        onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                                                        placeholder="New password"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                                    <Input
                                                        id="confirmPassword"
                                                        type="password"
                                                        required
                                                        value={passwords.confirmPassword}
                                                        onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                                                        placeholder="Confirm new password"
                                                    />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3 pt-2">
                                                <Button
                                                    type="submit"
                                                    disabled={updating}
                                                >
                                                    {updating ? 'Updating...' : 'Save Changes'}
                                                </Button>
                                                <Button
                                                    type="button"
                                                    variant="secondary"
                                                    onClick={() => {
                                                        setIsChangingPassword(false);
                                                        setPasswords({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                                    }}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </form>
                                    </CardContent>
                                )}
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Financial Summary Side Panel */}
                <div className="space-y-6">
                    <StatCard
                        title="Total Balance"
                        amount={loading ? 0 : (balance || 0)}
                        icon={BiWallet}
                        color="#7aa2f7"
                    />

                    <div className="glass-card p-6">
                        <h3 className="text-lg font-medium mb-4 text-foreground">Quick Actions</h3>
                        <div className="space-y-3">
                            <button onClick={() => toast.success('Feature coming soon!')} className="w-full py-3 px-4 rounded-xl bg-muted hover:bg-accent text-left text-sm text-foreground/80 transition-colors">
                                Export Data
                            </button>
                            <button onClick={() => toast.success('Feature coming soon!')} className="w-full py-3 px-4 rounded-xl bg-muted hover:bg-accent text-left text-sm text-foreground/80 transition-colors">
                                Delete Account
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default UserProfile;
