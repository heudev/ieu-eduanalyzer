import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    User,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { message } from 'antd';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signInWithGoogle: () => Promise<void>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => {
    return useContext(AuthContext);
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const auth = getAuth();

    const signInWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            message.success('Successfully signed in with Google');
        } catch (error) {
            message.error('An error occurred while signing in with Google');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            message.success('Successfully logged out');
        } catch (error) {
            message.error('An error occurred while logging out');
            throw error;
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, [auth]);

    const value = {
        currentUser,
        loading,
        signInWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};