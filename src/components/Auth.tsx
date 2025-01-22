import React, { useState } from 'react';
import { Button, Modal, Form, Input, Divider, Avatar, Dropdown } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { GoogleOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { logEvent } from 'firebase/analytics';
import { analytics } from '../firebase';

interface AuthProps {
    isLoggedIn: boolean;
}

const Auth: React.FC<AuthProps> = ({ isLoggedIn }) => {
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);
    const [form] = Form.useForm();
    const { signIn, signUp, signInWithGoogle, logout, currentUser } = useAuth();

    const handleLogin = async (values: { email: string; password: string }) => {
        try {
            await signIn(values.email, values.password);
            logEvent(analytics, 'login', {
                method: 'email'
            });
            setIsLoginModalVisible(false);
            form.resetFields();
        } catch (error: any) {
            console.error('Login error:', error);
            logEvent(analytics, 'login_error', {
                method: 'email',
                error: error.message
            });
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            logEvent(analytics, 'login', {
                method: 'google'
            });
            setIsLoginModalVisible(false);
            setIsSignupModalVisible(false);
        } catch (error: any) {
            console.error('Google login error:', error);
            logEvent(analytics, 'login_error', {
                method: 'google',
                error: error.message
            });
        }
    };

    const handleSignup = async (values: { email: string; password: string }) => {
        try {
            await signUp(values.email, values.password);
            logEvent(analytics, 'sign_up', {
                method: 'email'
            });
            setIsSignupModalVisible(false);
            form.resetFields();
        } catch (error: any) {
            console.error('Signup error:', error);
            logEvent(analytics, 'sign_up_error', {
                method: 'email',
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

    const renderGoogleButton = () => (
        <>
            <Divider>or</Divider>
            <Button
                icon={<GoogleOutlined />}
                onClick={handleGoogleLogin}
                block
                style={{ marginBottom: 16 }}
            >
                Sign In with Google
            </Button>
        </>
    );

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
                <div className="space-x-2">
                    <Button onClick={() => setIsLoginModalVisible(true)} type="primary">
                        Sign In
                    </Button>
                    <Button onClick={() => setIsSignupModalVisible(true)}>
                        Sign Up
                    </Button>
                </div>
            )}

            <Modal
                title="Sign In"
                open={isLoginModalVisible}
                onCancel={() => {
                    setIsLoginModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleLogin}
                    layout="vertical"
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email address' },
                            { type: 'email', message: 'Please enter a valid email address' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[{ required: true, message: 'Please enter your password' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Sign In
                        </Button>
                    </Form.Item>
                </Form>
                {renderGoogleButton()}
            </Modal>

            <Modal
                title="Sign Up"
                open={isSignupModalVisible}
                onCancel={() => {
                    setIsSignupModalVisible(false);
                    form.resetFields();
                }}
                footer={null}
            >
                <Form
                    form={form}
                    onFinish={handleSignup}
                    layout="vertical"
                >
                    <Form.Item
                        label="Email"
                        name="email"
                        rules={[
                            { required: true, message: 'Please enter your email address' },
                            { type: 'email', message: 'Please enter a valid email address' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Password"
                        name="password"
                        rules={[
                            { required: true, message: 'Please enter your password' },
                            { min: 6, message: 'Password must be at least 6 characters' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Sign Up
                        </Button>
                    </Form.Item>
                </Form>
                {renderGoogleButton()}
            </Modal>
        </div>
    );
};

export default Auth; 