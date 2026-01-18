import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../api/axios';
import { toast } from 'sonner';

interface User {
    id?: string;
    name: string;
    email: string;
    createdAt?: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
    updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);

    // Check if user is logged in on mount
    useEffect(() => {
        checkUserLoggedIn();
    }, []);

    const checkUserLoggedIn = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Try to fetch fresh user data
                const res = await api.get('/auth/profile');
                setUser(res.data);
                localStorage.setItem('user', JSON.stringify(res.data));
            } catch (error) {
                console.error("Auth check failed", error);
                // Fallback to local storage if API fails (e.g. offline) but usually we should logout if token invalid
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                } else {
                    localStorage.removeItem('token');
                }
            }
        }
        setLoading(false);
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const { accessToken, user } = res.data;

            localStorage.setItem('token', accessToken);
            localStorage.setItem('user', JSON.stringify(user));
            setUser(user);
            toast.success('Welcome back!');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Login failed');
            return false;
        }
    };

    const register = async (name: string, email: string, password: string): Promise<boolean> => {
        try {
            await api.post('/auth/register', { name, email, password });
            toast.success('Registration successful! Please login.');
            return true;
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Registration failed');
            return false;
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        toast.success('Logged out successfully');
    };

    const updateUser = (data: Partial<User>) => {
        if (user) {
            const updated = { ...user, ...data };
            setUser(updated);
            localStorage.setItem('user', JSON.stringify(updated));
        }
    };

    const value: AuthContextType = {
        user,
        login,
        register,
        logout,
        updateUser,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
