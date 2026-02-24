import React, { useState, useContext, useEffect } from 'react';
import { Card, Button, Input, Row, Col, message, Statistic, Typography, Tag, Timeline, Table } from 'antd';
import {
    CheckCircleOutlined,
    BookOutlined,
    TrophyOutlined,
    ClockCircleOutlined,
    UserOutlined
} from '@ant-design/icons';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [rank, setRank] = useState('-');
    const [otp, setOtp] = useState('');

    const [myBookings, setMyBookings] = useState([]);

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            const { data: profileData } = await axios.get('/profile/me');
            setProfile(profileData);

            const { data: leaderboard } = await axios.get('/profile/leaderboard');
            const myRank = leaderboard.findIndex(p => p.user._id === user._id) + 1;
            setRank(myRank > 0 ? `#${myRank}` : '-');

            const { data: bookingsData } = await axios.get('/bookings/my-bookings');
            setMyBookings(bookingsData);
        } catch (error) {
            console.error("Failed to fetch dashboard data", error);
        }
    };

    const handleDigitClick = (digit) => {
        if (otp.length < 4) {
            setOtp(otp + digit);
        }
    };

    const handleClear = () => {
        setOtp('');
    };

    const handleSubmit = async () => {
        if (otp.length !== 4) return message.warning('Please enter a 4-digit OTP');
        try {
            await axios.post('/attendance/mark', { code: otp });
            message.success({ content: 'Attendance Marked Successfully!', icon: <CheckCircleOutlined style={{ color: 'var(--success-color)' }} /> });
            setOtp('');
        } catch (error) {
            message.error(error.response?.data?.message || 'Attendance Failed'); // Improved error handling via axios interceptor usually, but keep fallback
        }
    };

    return (
        <div className="page-container">
            {/* Header Section */}
            <div style={{ marginBottom: '32px' }}>
                <Title level={2}>Dashboard</Title>
                <Text type="secondary" style={{ fontSize: '16px' }}>Welcome back, <span style={{ color: 'var(--primary-color)', fontWeight: 600 }}>{user?.name}</span></Text>
            </div>

            <Row gutter={[24, 24]}>
                {/* Left Column - Stats & Timeline */}
                <Col xs={24} lg={16}>
                    {/* Stats Row */}
                    <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                        <Col xs={24} sm={8}>
                            <Card className="card-modern" bordered={false} bodyStyle={{ padding: '24px' }}>
                                <Statistic
                                    title={<span style={{ color: 'var(--text-secondary)' }}><ClockCircleOutlined /> Next Class</span>}
                                    value="Physics"
                                    valueStyle={{ color: 'var(--primary-color)', fontWeight: 600, fontSize: '20px' }}
                                    prefix={<Tag color="blue">10:00 AM</Tag>}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card className="card-modern" bordered={false} bodyStyle={{ padding: '24px' }}>
                                <Statistic
                                    title={<span style={{ color: 'var(--text-secondary)' }}><TrophyOutlined /> My Rank</span>}
                                    value={rank}
                                    valueStyle={{ color: 'var(--warning-color)', fontWeight: 700 }}
                                />
                            </Card>
                        </Col>
                        <Col xs={24} sm={8}>
                            <Card className="card-modern" bordered={false} bodyStyle={{ padding: '24px' }}>
                                <Statistic
                                    title={<span style={{ color: 'var(--text-secondary)' }}><CheckCircleOutlined /> Total Points</span>}
                                    value={(profile?.rewardPoints || 0) + (profile?.activityPoints || 0)}
                                    valueStyle={{ color: 'var(--success-color)', fontWeight: 600 }}
                                />
                            </Card>
                        </Col>
                    </Row>

                    {/* Timeline / Recent Activity */}
                    <Card title="Recent PS Levels" className="card-modern" bordered={false}>
                        <Timeline mode="left" style={{ marginTop: '20px' }}>
                            {(profile?.psLevels || []).slice().reverse().slice(0, 5).map((level, idx) => (
                                <Timeline.Item key={idx} color="green" label={<Text type="secondary">Completed</Text>}>
                                    <Text strong>{level.subject}</Text> - <Tag color="cyan">Level {level.level}</Tag>
                                </Timeline.Item>
                            ))}
                            {(!profile?.psLevels || profile.psLevels.length === 0) && <Text type="secondary">No recent activity.</Text>}
                        </Timeline>
                        {(profile?.psLevels?.length || 0) > 5 && (
                            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                                <Button type="link">View All Activity</Button>
                            </div>
                        )}
                    </Card>

                    {/* Lab Bookings & Marks */}
                    <Card title="My Lab Bookings & Marks" className="card-modern" bordered={false} style={{ marginTop: '24px' }}>
                        <Table
                            dataSource={myBookings}
                            rowKey="_id"
                            pagination={{ pageSize: 5 }}
                            columns={[
                                { title: 'Lab', dataIndex: ['slotId', 'labName'] },
                                { title: 'Date', dataIndex: ['slotId', 'date'], render: d => new Date(d).toLocaleDateString() },
                                {
                                    title: 'Status',
                                    dataIndex: 'attendanceStatus',
                                    render: status => <Tag color={status === 'Present' ? 'green' : 'orange'}>{status}</Tag>
                                },
                                {
                                    title: 'Marks',
                                    dataIndex: 'marks',
                                    render: marks => marks !== undefined ? <Tag color="blue" style={{ fontSize: '14px', fontWeight: 'bold' }}>{marks}/100</Tag> : <Text type="secondary">-</Text>
                                }
                            ]}
                        />
                    </Card>
                </Col>

                {/* Right Column - Attendance Keypad */}
                <Col xs={24} lg={8}>
                    <Card
                        title={<div style={{ textAlign: 'center' }}>Mark Attendance</div>}
                        className="card-modern"
                        headStyle={{ borderBottom: 'none', fontSize: '18px' }}
                        bodyStyle={{ padding: '0 24px 24px 24px' }}
                    >
                        <div style={{
                            background: '#f8fafc',
                            padding: '16px',
                            borderRadius: '12px',
                            marginBottom: '20px',
                            textAlign: 'center',
                            border: '1px solid var(--border-color)'
                        }}>
                            <Input
                                value={otp}
                                readOnly
                                variant="borderless"
                                style={{
                                    textAlign: 'center',
                                    fontSize: '32px',
                                    letterSpacing: '12px',
                                    fontWeight: 'bold',
                                    color: 'var(--primary-dark)',
                                    background: 'transparent'
                                }}
                                placeholder="----"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                                <Button
                                    key={num}
                                    shape="circle"
                                    size="large"
                                    style={{ height: '60px', width: '60px', margin: '0 auto', fontSize: '20px', fontWeight: 500 }}
                                    onClick={() => handleDigitClick(num.toString())}
                                >
                                    {num}
                                </Button>
                            ))}
                            <Button
                                shape="circle"
                                size="large"
                                danger
                                style={{ height: '60px', width: '60px', margin: '0 auto' }}
                                onClick={handleClear}
                            >
                                C
                            </Button>
                            <Button
                                shape="circle"
                                size="large"
                                style={{ height: '60px', width: '60px', margin: '0 auto', fontSize: '20px', fontWeight: 500 }}
                                onClick={() => handleDigitClick('0')}
                            >
                                0
                            </Button>
                            <Button
                                type="primary"
                                shape="circle"
                                size="large"
                                icon={<CheckCircleOutlined />}
                                style={{ height: '60px', width: '60px', margin: '0 auto' }}
                                onClick={handleSubmit}
                            />
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default StudentDashboard;
