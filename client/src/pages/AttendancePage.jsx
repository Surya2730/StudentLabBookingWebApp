import React, { useState, useEffect, useContext } from 'react';
import { Layout, Card, Progress, Statistic, Row, Col } from 'antd';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const { Content } = Layout;

const AttendancePage = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({ totalSessions: 0, attendedSessions: 0, percentage: 0 });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/attendance/stats', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setStats(data);
            } catch (error) {
                console.error(error);
            }
        };
        if (user) fetchStats();
    }, [user]);

    return (
        <Content style={{ padding: '20px' }}>
            <h2>Attendance Status</h2>
            <Row gutter={16}>
                <Col span={8}>
                    <Card>
                        <Statistic title="Total Classes" value={stats.totalSessions} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Attended" value={stats.attendedSessions} valueStyle={{ color: '#3f8600' }} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card>
                        <Statistic title="Percentage" value={stats.percentage} suffix="%" />
                        <Progress percent={parseFloat(stats.percentage)} status={stats.percentage < 75 ? "exception" : "active"} />
                    </Card>
                </Col>
            </Row>
        </Content>
    );
};

export default AttendancePage;
