import React, { useState, useEffect, useContext } from 'react';
import { Card, Progress, Statistic, Row, Col, Typography } from 'antd';
import { ScheduleOutlined, CheckCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;

const AttendancePage = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ totalActiveDays: 0, earnedCredits: 0, percentage: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('/attendance/stats');
                setStats(data);
            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchStats();
    }, [user]);

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <Title level={2}>Attendance Analytics</Title>
                <Text type="secondary">Track your class attendance compliance.</Text>
            </div>

            <Row gutter={[24, 24]} justify="center">
                <Col xs={24} md={8}>
                    <Card className="card-modern" style={{ textAlign: 'center', height: '100%' }}>
                        <div style={{ marginBottom: '16px' }}>
                            <Title level={4}>Performance</Title>
                        </div>
                        <Progress
                            type="circle"
                            percent={parseFloat(stats.percentage)}
                            status={stats.percentage < 75 ? "exception" : "success"}
                            width={160}
                            strokeWidth={8}
                        />
                        <div style={{ marginTop: '20px' }}>
                            <Text type={stats.percentage < 75 ? "danger" : "secondary"}>
                                {stats.percentage < 75 ? "Below 75% Requirement" : "Good Attendance Record"}
                            </Text>
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={16}>
                    <Row gutter={[24, 24]}>
                        <Col span={12}>
                            <Card className="card-modern" bodyStyle={{ padding: '32px' }}>
                                <Statistic
                                    title={<span style={{ fontSize: '16px' }}>Total Academic Days</span>}
                                    value={stats.totalActiveDays}
                                    prefix={<ScheduleOutlined style={{ color: 'var(--primary-color)' }} />}
                                />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card className="card-modern" bodyStyle={{ padding: '32px' }}>
                                <Statistic
                                    title={<span style={{ fontSize: '16px' }}>Days Present</span>}
                                    value={stats.earnedCredits}
                                    precision={1}
                                    valueStyle={{ color: 'var(--success-color)' }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={24}>
                            <Card className="card-modern" bodyStyle={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                                <InfoCircleOutlined style={{ fontSize: '24px', color: 'var(--info-color)' }} />
                                <div>
                                    <Text strong>Attendance Tip</Text>
                                    <div style={{ color: 'var(--text-secondary)' }}>Maintain above 75% to be eligible for exams. Make sure to mark attendance via OTP in every class.</div>
                                </div>
                            </Card>
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
};

export default AttendancePage;
