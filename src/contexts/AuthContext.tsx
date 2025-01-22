import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    getAuth,
    onAuthStateChanged,
    User,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    GoogleAuthProvider,
    signInWithPopup
} from 'firebase/auth';
import { message } from 'antd';

interface AuthContextType {
    currentUser: User | null;
    loading: boolean;
    signIn: (email: string, password: string) => Promise<void>;
    signUp: (email: string, password: string) => Promise<void>;
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

    const signIn = async (email: string, password: string) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            message.success('Successfully signed in');
        } catch (error) {
            message.error('An error occurred while signing in');
            throw error;
        }
    };

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

    const signUp = async (email: string, password: string) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            message.success('Account successfully created');
        } catch (error) {
            message.error('An error occurred while creating account');
            throw error;
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
            message.success('Successfully signed out');
        } catch (error) {
            message.error('An error occurred while signing out');
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
        signIn,
        signUp,
        signInWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}; 