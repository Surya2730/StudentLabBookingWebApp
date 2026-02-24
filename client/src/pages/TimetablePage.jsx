import React, { useState, useEffect, useContext } from 'react';
import { Layout, Table, Card, Typography, Empty, Tag } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;

const TimetablePage = () => {
    const { user } = useContext(AuthContext);
    const [timetable, setTimetable] = useState(null);

    useEffect(() => {
        const fetchTimetable = async () => {
            try {
                const { data } = await axios.get('/timetable', {
                    params: { department: user.department }
                });
                setTimetable(data);
            } catch (error) {
                console.error("Failed to fetch timetable", error);
            }
        };
        if (user) fetchTimetable();
    }, [user]);

    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const tableData = days.map(day => ({
        key: day,
        day,
        periods: timetable?.schedule?.[day] || []
    }));

    const columns = [
        {
            title: 'Day',
            dataIndex: 'day',
            key: 'day',
            width: 120,
            fixed: 'left',
            render: (t) => <strong style={{ color: 'var(--primary-color)' }}>{t}</strong>
        },
        ...Array.from({ length: 7 }, (_, i) => ({
            title: `Period ${i + 1}`,
            render: (_, record) => (
                <div style={{
                    padding: '8px',
                    background: record.periods[i] ? '#f0faff' : 'transparent',
                    borderRadius: '4px',
                    textAlign: 'center',
                    minWidth: '100px',
                    color: record.periods[i] ? '#0050b3' : '#ccc',
                    fontWeight: record.periods[i] ? 500 : 400
                }}>
                    {record.periods[i] || '-'}
                </div>
            )
        }))
    ];

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <Title level={2}>My Timetable</Title>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <Text type="secondary">Weekly Schedule</Text>
                    {user && <Tag color="blue">{user.department}</Tag>}
                </div>
            </div>

            <Card className="card-modern">
                {timetable ? (
                    <Table
                        dataSource={tableData}
                        columns={columns}
                        pagination={false}
                        bordered
                        scroll={{ x: true }}
                    />
                ) : (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="No timetable available yet."
                    />
                )}
            </Card>
        </div>
    );
};

export default TimetablePage;
