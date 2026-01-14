import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BiEnvelope, BiLockAlt } from 'react-icons/bi';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(email, password);
        if (success) {
            navigate('/dashboard');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
            <div className="glass-card w-full max-w-md p-10">
                <div className="mb-10 text-center">
                    <h1 className="text-3xl font-medium tracking-tight mb-2 text-white">Welcome back</h1>
                    <p className="text-white/40">Enter your details to access your account.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-[0.8rem] font-medium text-white/50 mb-2 ml-1 uppercase tracking-widest">Email Address</label>
                        <div className="relative">
                            <BiEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-12"
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[0.8rem] font-medium text-white/50 mb-2 ml-1 uppercase tracking-widest">Password</label>
                        <div className="relative">
                            <BiLockAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" size={20} />
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-12"
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-primary justify-center !py-4 text-lg mt-4 disabled:opacity-50 transition-all active:scale-[0.98]"
                    >
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-10 text-white/40">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-white font-medium hover:underline transition-all">
                        Create one
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
