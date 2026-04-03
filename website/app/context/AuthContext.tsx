'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

type User = {
    id: number;
    name: string;
    email: string;
    phone: string;
    points?: number;
    tier?: string;
    totalOrders?: number;
    totalSpent?: number;
    joinDate?: string;
};

type AuthContextType = {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (token: string, user: User) => void;
    logout: (token?: string) => Promise<void>;
    updateUser: (user: Partial<User>) => void;
    refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api';

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = localStorage.getItem('eggok_token');
        const savedUser = localStorage.getItem('eggok_user');

        if (savedToken && savedUser) {
            try {
                setToken(savedToken);
                setUser(JSON.parse(savedUser));
                console.log('[AUTH] Session found in localStorage, refreshing profile...');
                // Refresh profile in background to ensure data is up to date and token is still valid
                fetchProfile(savedToken);
            } catch (e) {
                console.error('Failed to parse saved user', e);
                logout();
            }
        } else {
            setLoading(false);
        }
    }, []);

    const fetchProfile = async (authToken: string) => {
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                },
            });

            if (res.ok) {
                const profile = await res.json();
                console.log('[AUTH] Profile refreshed successfully');
                setUser(profile);
                localStorage.setItem('eggok_user', JSON.stringify(profile));
            } else {
                console.warn(`[AUTH] Profile refresh failed with status: ${res.status}`);
                if (res.status === 401) {
                    console.error('[AUTH] 401 Unauthorized - logging out');
                    logout(authToken);
                }
            }
        } catch (e) {
            console.error('[AUTH] ERROR fetching profile:', e);
        } finally {
            setLoading(false);
        }
    };

    const login = (newToken: string, newUser: User) => {
        setToken(newToken);
        setUser(newUser);
        localStorage.setItem('eggok_token', newToken);
        localStorage.setItem('eggok_user', JSON.stringify(newUser));
    };

    const logout = async (authToken?: string) => {
        const tokenToRevoke = authToken ?? token;
        if (tokenToRevoke) {
            try {
                await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: { 'Authorization': `Bearer ${tokenToRevoke}` },
                });
            } catch {
                // ignore network errors — clear session regardless
            }
        }
        setToken(null);
        setUser(null);
        localStorage.removeItem('eggok_token');
        localStorage.removeItem('eggok_user');
    };

    const updateUser = (data: Partial<User>) => {
        if (!user) return;
        const updated = { ...user, ...data };
        setUser(updated);
        localStorage.setItem('eggok_user', JSON.stringify(updated));
    };

    const refreshProfile = async () => {
        if (token) {
            await fetchProfile(token);
        }
    };

    return (
        <AuthContext.Provider value={{
            user,
            token,
            loading,
            login,
            logout,
            updateUser,
            refreshProfile,
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}
