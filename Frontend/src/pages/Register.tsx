import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { BiEnvelope, BiLockAlt, BiUser } from 'react-icons/bi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const Register = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const success = await register(name, email, password);
        if (success) {
            navigate('/login');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-transparent flex items-center justify-center p-6">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center space-y-2">
                    <CardTitle className="text-3xl font-medium tracking-tight text-foreground">
                        Create Account
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                        Join Momentum and start tracking your wealth.
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label htmlFor="name" className="form-label">
                                Full Name
                            </label>
                            <div className="relative">
                                <BiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={20} />
                                <Input
                                    id="name"
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="pl-12"
                                    placeholder="Rami Khayata"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="email" className="form-label">
                                Email Address
                            </label>
                            <div className="relative">
                                <BiEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={20} />
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-12"
                                    placeholder="you@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="password" className="form-label">
                                Password
                            </label>
                            <div className="relative">
                                <BiLockAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/30" size={20} />
                                <Input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-12"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-12 text-base mt-4"
                            size="lg"
                        >
                            {loading ? 'Creating account...' : 'Get Started'}
                        </Button>
                    </form>

                    <p className="text-center mt-8 text-sm text-muted-foreground">
                        Already have an account?{' '}
                        <Link to="/login" className="text-foreground font-medium hover:underline transition-all">
                            Sign In
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
};

export default Register;
