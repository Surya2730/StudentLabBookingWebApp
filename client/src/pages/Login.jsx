import React, { useState, useContext } from 'react';
import { Card, Button, Form, Input, Select, Typography, message } from 'antd';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';

const { Title } = Typography;
const { Option } = Select;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const [selectedRole, setSelectedRole] = useState('student');
    const [selectedDept, setSelectedDept] = useState('CSE');

    // Dev Login Handler
    const handleDevLogin = async (values) => {
        setLoading(true);
        try {
            // Merge form values (email) with state values (role, department)
            const payload = {
                ...values,
                role: selectedRole,
                department: selectedDept
            };
            const { data } = await axios.post('http://localhost:5000/api/auth/dev-login', payload);
            login(data);
            message.success(`Logged in as ${data.name}`);
            if (data.role === 'faculty') {
                navigate('/faculty/home');
            } else {
                navigate('/student-dashboard');
            }
        } catch (error) {
            message.error(error.response?.data?.message || 'Login failed');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        try {
            const { data } = await axios.post('http://localhost:5000/api/auth/google', {
                token: credentialResponse.credential,
                role: selectedRole,       // Send selected role
                department: selectedDept  // Send selected department
            });
            login(data);
            message.success(`Logged in as ${data.name}`);
            if (data.role === 'faculty') {
                navigate('/faculty/home');
            } else {
                navigate('/student-dashboard');
            }
        } catch (error) {
            console.error(error);
            message.error('Google Login Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#f0f2f5' }}>
            <Card style={{ width: 400, textAlign: 'center' }}>
                <Title level={3}>Lab Slot Booking</Title>

                {/* Common Selections */}
                <div style={{ marginBottom: 20, textAlign: 'left' }}>
                    <div style={{ marginBottom: 10 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>Select Role:</label>
                        <Select value={selectedRole} onChange={setSelectedRole} style={{ width: '100%' }}>
                            <Option value="student">Student</Option>
                            <Option value="faculty">Faculty</Option>
                        </Select>
                    </div>
                    <div style={{ marginBottom: 20 }}>
                        <label style={{ display: 'block', marginBottom: 5 }}>Select Department:</label>
                        <Select value={selectedDept} onChange={setSelectedDept} style={{ width: '100%' }}>
                            <Option value="CSE">CSE</Option>
                            <Option value="ECE">ECE</Option>
                            <Option value="EEE">EEE</Option>
                        </Select>
                    </div>
                </div>

                <div style={{ marginBottom: 30 }}>
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={() => message.error('Login Failed')}
                        useOneTap
                    />
                </div>

                <div style={{ borderTop: '1px solid #eee', paddingTop: 20 }}>
                    <p style={{ fontWeight: 'bold' }}>Or Development Login (Mock)</p>
                    <Form onFinish={handleDevLogin} layout="vertical">
                        <Form.Item name="email" rules={[{ required: true, message: 'Please input your email!' }]}>
                            <Input placeholder="Enter email (e.g. user@college.edu)" />
                        </Form.Item>
                        <Button type="primary" htmlType="submit" loading={loading} block>
                            Dev Login
                        </Button>
                    </Form>
                </div>
            </Card>
        </div>
    );
};

export default Login;
