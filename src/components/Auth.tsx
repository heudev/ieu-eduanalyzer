import React, { useState } from 'react';
import { Button, Modal, Form, Input, Divider } from 'antd';
import { useAuth } from '../contexts/AuthContext';
import { GoogleOutlined } from '@ant-design/icons';

interface AuthProps {
    isLoggedIn: boolean;
}

const Auth: React.FC<AuthProps> = ({ isLoggedIn }) => {
    const [isLoginModalVisible, setIsLoginModalVisible] = useState(false);
    const [isSignupModalVisible, setIsSignupModalVisible] = useState(false);
    const [form] = Form.useForm();
    const { signIn, signUp, signInWithGoogle, logout } = useAuth();

    const handleLogin = async (values: { email: string; password: string }) => {
        try {
            await signIn(values.email, values.password);
            setIsLoginModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Login error:', error);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            await signInWithGoogle();
            setIsLoginModalVisible(false);
            setIsSignupModalVisible(false);
        } catch (error) {
            console.error('Google login error:', error);
        }
    };

    const handleSignup = async (values: { email: string; password: string }) => {
        try {
            await signUp(values.email, values.password);
            setIsSignupModalVisible(false);
            form.resetFields();
        } catch (error) {
            console.error('Signup error:', error);
        }
    };

    const handleLogout = async () => {
        try {
            await logout();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const renderGoogleButton = () => (
        <>
            <Divider>veya</Divider>
            <Button
                icon={<GoogleOutlined />}
                onClick={handleGoogleLogin}
                block
                style={{ marginBottom: 16 }}
            >
                Google ile Giriş Yap
            </Button>
        </>
    );

    return (
        <div>
            {isLoggedIn ? (
                <Button onClick={handleLogout} type="primary" danger>
                    Çıkış Yap
                </Button>
            ) : (
                <div className="space-x-2">
                    <Button onClick={() => setIsLoginModalVisible(true)} type="primary">
                        Giriş Yap
                    </Button>
                    <Button onClick={() => setIsSignupModalVisible(true)}>
                        Kayıt Ol
                    </Button>
                </div>
            )}

            <Modal
                title="Giriş Yap"
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
                        label="E-posta"
                        name="email"
                        rules={[
                            { required: true, message: 'Lütfen e-posta adresinizi girin' },
                            { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Şifre"
                        name="password"
                        rules={[{ required: true, message: 'Lütfen şifrenizi girin' }]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Giriş Yap
                        </Button>
                    </Form.Item>
                </Form>
                {renderGoogleButton()}
            </Modal>

            <Modal
                title="Kayıt Ol"
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
                        label="E-posta"
                        name="email"
                        rules={[
                            { required: true, message: 'Lütfen e-posta adresinizi girin' },
                            { type: 'email', message: 'Geçerli bir e-posta adresi girin' }
                        ]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Şifre"
                        name="password"
                        rules={[
                            { required: true, message: 'Lütfen şifrenizi girin' },
                            { min: 6, message: 'Şifre en az 6 karakter olmalıdır' }
                        ]}
                    >
                        <Input.Password />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Kayıt Ol
                        </Button>
                    </Form.Item>
                </Form>
                {renderGoogleButton()}
            </Modal>
        </div>
    );
};

export default Auth; 