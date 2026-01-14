import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout';
import StatCard from '../components/StatCard';
import api from '../api/axios';
import { BiWallet, BiUser, BiEnvelope, BiCalendar, BiEdit } from 'react-icons/bi';
import { toast } from 'react-hot-toast';

const UserProfile = () => {
    const { user } = useAuth();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        const fetchBalance = async () => {
            try {
                // Fetch stats to get the balance
                // We can reuse the stats endpoint or create a specific one. 
                // Since the dashboard uses /transactions/stats, we'll use that.
                // However, stats usually takes a month/year filter.
                // If we want "Total" balance (all time), we might need to adjust the backend or pass a wide range.
                // But the user request said "total balance that is also visible from the dashboard".
                // Dashboard defaults to current month. Let's assume the user means "Current Month's Balance" or we can calculate total.
                // Let's try to get TOTAL balance across all time if possible, or just replicate dashboard behavior.
                // Dashboard behavior:
                // const today = new Date();
                // params: { month: today.getMonth() + 1, year: today.getFullYear() }

                // Let's stick to current month for consistency with Dashboard "Total Balance" 
                // OR we could fetch without params if the backend supports "all time" when no params are provided.
                // Looking at backend code:
                // if (month && year) { filter... } 
                // If NO month/year provided, it fetches ALL transactions!
                // So calling without params gives all-time stats. Perfect!

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

    const memberSince = user?.createdAt
        ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'Unknown';

    return (
        <Layout>
            <div className="mb-12">
                <h1 className="text-4xl font-medium tracking-tight mb-2 text-white">My Profile</h1>
                <p className="text-white/40">Manage your personal information and view account summary.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Details Card */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="glass-card p-8 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <BiUser size={150} />
                        </div>

                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl">
                                {user?.name?.[0]?.toUpperCase() || 'U'}
                            </div>

                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div>
                                    <h2 className="text-3xl font-bold text-white">{user?.name}</h2>
                                    <p className="text-blue-400 font-medium tracking-wide">Premium Member</p>
                                </div>

                                <div className="space-y-2 pt-4 border-t border-white/10">
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-white/70">
                                        <BiEnvelope className="text-blue-400" size={20} />
                                        <span>{user?.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center md:justify-start gap-3 text-white/70">
                                        <BiCalendar className="text-purple-400" size={20} />
                                        <span>Member since {memberSince}</span>
                                    </div>
                                </div>
                            </div>

                            <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm font-medium transition-colors border border-white/5">
                                <BiEdit size={16} />
                                Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* Placeholder for future settings */}
                    <div className="glass-card p-8">
                        <h3 className="text-xl font-medium mb-6 text-white">Account Settings</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <div>
                                    <p className="text-white font-medium">Email Preferences</p>
                                    <p className="text-white/40 text-sm">Manage your notifications</p>
                                </div>
                                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">Manage</button>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                                <div>
                                    <p className="text-white font-medium">Security</p>
                                    <p className="text-white/40 text-sm">Change password and 2FA</p>
                                </div>
                                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">Update</button>
                            </div>
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
                        <h3 className="text-lg font-medium mb-4 text-white">Quick Actions</h3>
                        <div className="space-y-3">
                            <button onClick={() => toast.success('Feature coming soon!')} className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-left text-sm text-white/80 transition-colors">
                                Export Data
                            </button>
                            <button onClick={() => toast.success('Feature coming soon!')} className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-left text-sm text-white/80 transition-colors">
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
