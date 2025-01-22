import React from 'react';
import { Button, Dropdown, Avatar } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { GoogleOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebase';

interface AuthProps {
    isLoggedIn: boolean;
}

const Auth: React.FC<AuthProps> = ({ isLoggedIn }) => {
    const { signInWithGoogle, logout, currentUser } = useAuth();

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            logEvent(analytics, 'login', {
                method: 'google'
            });
        } catch (error: any) {
            console.error('Google login error:', error);
            logEvent(analytics, 'login_error', {
                method: 'google',
                error: error.message
            });
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
            logEvent(analytics, 'logout');
        } catch (error: any) {
            console.error('Logout error:', error);
            logEvent(analytics, 'logout_error', {
                error: error.message
            });
        }
    };

    const userMenuItems = [
        {
            key: 'email',
            label: currentUser?.email,
            icon: <UserOutlined />,
        },
        {
            key: 'logout',
            label: 'Sign Out',
            icon: <LogoutOutlined />,
            onClick: handleLogout,
            danger: true,
        },
    ];

    return (
        <div>
            {isLoggedIn ? (
                <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                    <Avatar
                        style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}
                        icon={<UserOutlined />}
                        src={currentUser?.photoURL}
                    />
                </Dropdown>
            ) : (
                <Button
                    icon={<GoogleOutlined />}
                    onClick={handleGoogleLogin}
                    type="primary"
                >
                    Sign in with Google
                </Button>
            )}
        </div>
    );
};

export default Auth; 