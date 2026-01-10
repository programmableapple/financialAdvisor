import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';

interface User {
    id?: string;
    name: string;
    email: string;
    [key: string]: any;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<boolean>;
    register: (name: string, email: string, password: string) => Promise<boolean>;
    logout: () => void;
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
                // Assuming we might have a 'me' endpoint or just trusting the token for now
                const savedUser = localStorage.getItem('user');
                if (savedUser) {
                    setUser(JSON.parse(savedUser));
                }
            } catch (error) {
                console.error("Auth check failed", error);
                localStorage.removeItem('token');
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

    const value: AuthContextType = {
        user,
        login,
        register,
        logout,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
