import { createContext, useState, useEffect, type ReactNode } from 'react';
import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001/api';

interface User {
    _id: string;
    email: string;
    name: string;
    createdAt: string;
    lastLogin?: string;
}

interface UserContextType {
    user: User | null;
    setUser: (user: User | null) => void;
    loading: boolean;
}

const defaultContextValue: UserContextType = {
    user: null,
    setUser: () => { },
    loading: true,
};

export const UserContext = createContext<UserContextType>(defaultContextValue);

interface UserContextProviderProps {
    children: ReactNode;
}

export function UserContextProvider({ children }: UserContextProviderProps) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { data } = await axios.get(`${BACKEND_URL}/auth/verify-auth`, {
                    withCredentials: true
                });
                if (data.user) {
                    setUser(data.user);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserContext.Provider>
    );
}