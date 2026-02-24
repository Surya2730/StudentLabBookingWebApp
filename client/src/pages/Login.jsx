import React, { useState, useContext } from 'react';
import { Form, Input, Button, Typography, Divider, message } from 'antd';
import { LockOutlined, MailOutlined } from '@ant-design/icons';
import { AuthContext } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';


const { Title, Text } = Typography;

const Login = () => {
    const { loginWithGoogle, loginWithEmail } = useContext(AuthContext);
    const [loading, setLoading] = useState(false);

    // Handle Email/Password Login
    const onLoginFinish = async (values) => {
        setLoading(true);
        try {
            await loginWithEmail(values.email, values.password);
            message.success('Login Successful!');
        } catch (error) {
            message.error(error.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        try {
            // Role and Department are now handled by backend logic (auto-assigned)
            await loginWithGoogle(credentialResponse.credential);
            message.success('Login Successful!');
        } catch (error) {
            message.error('Google Login Failed');
        }
    };

    return (
        <div style={{ display: 'flex', minHeight: '80vh', boxShadow: 'var(--shadow-xl)', borderRadius: '24px', overflow: 'hidden', background: '#fff', maxWidth: '1000px', width: '100%', margin: '0 20px' }}>
            {/* Left Side - Image/Brand */}
            <div style={{ flex: 1, background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)', padding: '60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', color: '#fff', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    {/* <div style={{ marginBottom: '30px' }}>
                        <img
                            src="/logo.png"
                            alt="College Logo"
                            style={{ width: '120px', height: 'auto', display: 'block', margin: '0 auto', filter: 'brightness(0) invert(1)' }}
                        />
                    </div> */}
                    <h1 style={{ color: '#fff', fontSize: '3rem', margin: 0, fontWeight: 800, textAlign: 'center' }}>LabBooking</h1>
                    <p style={{ fontSize: '1.2rem', opacity: 0.9, marginTop: '20px', textAlign: 'center' }}>
                        Seamless slot management for modern universities.
                    </p>
                    <div style={{ marginTop: '40px', display: 'flex', gap: '10px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff', opacity: 0.8 }}></div>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff', opacity: 0.4 }}></div>
                        <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fff', opacity: 0.4 }}></div>
                    </div>
                </div>
                {/* Abstract Shapes */}
                <div style={{ position: 'absolute', top: '-10%', right: '-10%', width: '300px', height: '300px', background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
                <div style={{ position: 'absolute', bottom: '-20%', left: '-10%', width: '400px', height: '400px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}></div>
            </div>

            {/* Right Side - Form */}
            <div style={{ flex: 1.2, padding: '40px 60px', display: 'flex', flexDirection: 'column', justifyContent: 'center', background: '#fff' }}>
                <div style={{ textAlign: 'center', marginBottom: '30px' }}>
                    <img
                        src="/logo.png"
                        alt="College Logo"
                        style={{ width: '80px', height: 'auto', marginBottom: '16px' }}
                    />
                    <Title level={2} style={{ marginBottom: 0 }}>Welcome Back</Title>
                    <Text type="secondary">Sign in to access your lab schedule.</Text>
                </div>

                {/* Email/Pass Login Form */}
                <Form layout="vertical" onFinish={onLoginFinish} size="large">
                    <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                        <Input prefix={<MailOutlined />} placeholder="Email Address" />
                    </Form.Item>
                    <Form.Item name="password" rules={[{ required: true, message: 'Please input your password!' }]}>
                        <Input.Password prefix={<LockOutlined />} placeholder="Password" />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading} style={{ marginBottom: '16px' }}>
                        Log In
                    </Button>
                </Form>

                <Divider plain><Text type="secondary" style={{ fontSize: '12px' }}>OR</Text></Divider>

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                    {/* Google Login Wrapper */}
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => message.error('Google Login Failed')}
                        width="300px"
                        text="signin_with"
                        shape="pill"
                    />
                </div>
            </div>
        </div>
    );
};

export default Login;
