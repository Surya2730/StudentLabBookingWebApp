import React, { useState, useContext, useEffect } from 'react';
import { Layout, Card, Button, Input, Row, Col, message, Statistic } from 'antd';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CheckCircleOutlined } from '@ant-design/icons';

const { Content } = Layout;

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [rank, setRank] = useState('-');
    const [otp, setOtp] = useState('');

    useEffect(() => {
        if (user) {
            fetchDashboardData();
        }
    }, [user]);

    const fetchDashboardData = async () => {
        try {
            // Fetch Profile
            const { data: profileData } = await axios.get('http://localhost:5000/api/profile/me', {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setProfile(profileData);

            // Fetch Leaderboard for Rank
            const { data: leaderboard } = await axios.get('http://localhost:5000/api/profile/leaderboard');
            const myRank = leaderboard.findIndex(p => p.user._id === user._id) + 1;
            setRank(myRank > 0 ? `#${myRank}` : '-');

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
            await axios.post('http://localhost:5000/api/attendance/mark', { code: otp }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            message.success('Attendance Marked Successfully!');
            setOtp('');
        } catch (error) {
            message.error(error.response?.data?.message || 'Attendance Failed');
        }
    };

    return (
        <Content style={{ padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <h1 style={{ marginBottom: '20px' }}>Welcome, {user?.name}</h1>

            <Card title="Mark Class Attendance" style={{ width: 300, textAlign: 'center', boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
                <div style={{ marginBottom: '20px' }}>
                    <Input
                        value={otp}
                        readOnly
                        style={{ textAlign: 'center', fontSize: '24px', letterSpacing: '5px' }}
                        placeholder="----"
                    />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(num => (
                        <Button key={num} size="large" onClick={() => handleDigitClick(num.toString())}>
                            {num}
                        </Button>
                    ))}
                    <Button size="large" danger onClick={handleClear}>C</Button>
                    <Button size="large" onClick={() => handleDigitClick('0')}>0</Button>
                    <Button size="large" type="primary" onClick={handleSubmit} icon={<CheckCircleOutlined />}>OK</Button>
                </div>
            </Card>

            <Row gutter={16} style={{ marginTop: '40px', width: '100%', maxWidth: '800px' }}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Next Class" value="Physics (10:00 AM)" valueStyle={{ fontSize: '18px' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="My Rank" value={rank} valueStyle={{ color: '#cf1322' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Points" value={(profile?.rewardPoints || 0) + (profile?.activityPoints || 0)} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={16} style={{ marginTop: '20px', width: '100%', maxWidth: '800px' }}>
                <Col span={24}>
                    <Card title="Recent PS Levels Completed">
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                            {(profile?.psLevels || []).slice().reverse().slice(0, 5).map((level, idx) => (
                                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', background: '#f0f2f5', borderRadius: '4px' }}>
                                    <span style={{ fontWeight: 'bold' }}>{level.subject}</span>
                                    <span style={{ color: '#1890ff' }}>Level {level.level}</span>
                                </div>
                            ))}
                            {(!profile?.psLevels || profile.psLevels.length === 0) && <p style={{ color: '#999' }}>No levels completed yet.</p>}
                            {(profile?.psLevels?.length || 0) > 5 && <div style={{ textAlign: 'center', color: '#999' }}>+ {(profile?.psLevels?.length || 0) - 5} more (view in Profile)</div>}
                        </div>
                    </Card>
                </Col>
            </Row>
        </Content>
    );
};

export default StudentDashboard;
