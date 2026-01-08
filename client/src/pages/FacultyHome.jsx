import React, { useState, useContext, useEffect } from 'react';
import { Card, Button, Select, Tag, message, Typography, Row, Col } from 'antd';
import { ReloadOutlined, ThunderboltOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const { Option } = Select;
const { Title, Text } = Typography;

const FacultyHome = () => {
    const { user } = useContext(AuthContext);

    // Define all hooks at the top level, unconditionally
    const [classOtp, setClassOtp] = useState(null);
    const [classPeriod, setClassPeriod] = useState(null);
    const [classDept, setClassDept] = useState('CSE'); // Default to CSE safely
    const [loading, setLoading] = useState(false);

    // Initialize department from user if available, inside useEffect or safely in state init if user is guaranteed not to change from null to object in a way that breaks hooks (but here user starts null)
    // Actually, setting initial state based on user is fine if user is present, but if user is null initially, we stick to default.
    // We can update it with useEffect when user loads.

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        if (user) {
            setClassDept(user.department || 'CSE');
            fetchActiveOTP();
        }
    }, [user]);

    const fetchActiveOTP = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/attendance/active-otp`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            if (data) {
                setClassOtp(data);
                if (data.metadata) {
                    setClassDept(data.metadata.department);
                    setClassPeriod(data.metadata.period);
                }
            }
        } catch (error) {
            console.error('Failed to fetch active OTP');
        }
    };

    const generateClassOTP = async () => {
        setLoading(true);
        try {
            const { data } = await axios.post(`${API_URL}/attendance/generate-otp`, {
                period: classPeriod,
                department: classDept
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setClassOtp(data);
            message.success('Class OTP Generated Successfully');
        } catch (error) {
            console.error(error);
            message.error('Failed to generate Class OTP');
        } finally {
            setLoading(false);
        }
    };

    // Conditional rendering MUST happen after all hooks
    if (!user) {
        return <div style={{ padding: '20px', textAlign: 'center' }}>Loading user data...</div>;
    }

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100%' }}>
            <Title level={2} style={{ marginBottom: '24px', color: '#001529' }}>Welcome, {user.name}</Title>

            <Row justify="center">
                <Col xs={24} md={12} lg={10}>
                    <Card
                        hoverable
                        style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        title={<Title level={4} style={{ margin: 0 }}><ThunderboltOutlined style={{ color: '#1890ff' }} /> Quick Attendance OTP</Title>}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                            <div>
                                <Text strong>Select Department</Text>
                                <Select
                                    placeholder="Select Department"
                                    style={{ width: '100%', marginTop: '8px' }}
                                    value={classDept}
                                    onChange={setClassDept}
                                    size="large"
                                >
                                    <Option value="CSE">CSE</Option>
                                    <Option value="ECE">ECE</Option>
                                    <Option value="EEE">EEE</Option>
                                </Select>
                            </div>

                            <div>
                                <Text strong>Select Period</Text>
                                <Select
                                    placeholder="Select Period"
                                    style={{ width: '100%', marginTop: '8px' }}
                                    onChange={setClassPeriod}
                                    size="large"
                                    value={classPeriod}
                                >
                                    {[1, 2, 3, 4, 5, 6, 7].map(p => (
                                        <Option key={p} value={p}>Period {p}</Option>
                                    ))}
                                </Select>
                            </div>

                            <Button
                                type="primary"
                                size="large"
                                onClick={generateClassOTP}
                                disabled={!classPeriod}
                                loading={loading}
                                icon={<ReloadOutlined />}
                                style={{ height: '48px', fontSize: '18px', borderRadius: '8px', background: '#001529', borderColor: '#001529' }}
                            >
                                Generate OTP
                            </Button>

                            {classOtp && (
                                <div style={{
                                    marginTop: '20px',
                                    padding: '20px',
                                    background: '#e6f7ff',
                                    border: '1px dashed #1890ff',
                                    borderRadius: '8px',
                                    textAlign: 'center'
                                }}>
                                    <Text type="secondary">Share this OTP with students</Text>
                                    <div style={{ fontSize: '48px', fontWeight: 'bold', color: '#1890ff', letterSpacing: '4px', margin: '10px 0' }}>
                                        {classOtp.code}
                                    </div>
                                    <Text type="secondary" style={{ fontSize: '12px' }}>
                                        Expires at: {new Date(classOtp.expiresAt).toLocaleTimeString()}
                                    </Text>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default FacultyHome;
