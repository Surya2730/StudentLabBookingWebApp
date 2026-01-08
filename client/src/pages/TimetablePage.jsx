import React, { useState, useEffect, useContext } from 'react';
import { Layout, Table, Card } from 'antd';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const { Content } = Layout;

const TimetablePage = () => {
    const { user } = useContext(AuthContext);
    const [timetable, setTimetable] = useState(null);

    useEffect(() => {
        // Fetch timetable using department from user
        const fetchTimetable = async () => {
            try {
                // Assuming query params or backend infers from user token
                const { data } = await axios.get(`http://localhost:5000/api/timetable?department=${user.department}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setTimetable(data);
            } catch (error) {
                console.error("Failed to fetch timetable", error);
            }
        };
        if (user) fetchTimetable();
    }, [user]);

    // Data Transformation for Table
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const tableData = days.map(day => ({
        key: day,
        day,
        periods: timetable?.schedule?.[day] || []
    }));

    const columns = [
        { title: 'Day', dataIndex: 'day', key: 'day', width: 100 },
        { title: 'Period 1', render: (_, record) => record.periods[0] || '-' },
        { title: 'Period 2', render: (_, record) => record.periods[1] || '-' },
        { title: 'Period 3', render: (_, record) => record.periods[2] || '-' },
        { title: 'Period 4', render: (_, record) => record.periods[3] || '-' },
        { title: 'Period 5', render: (_, record) => record.periods[4] || '-' },
        { title: 'Period 6', render: (_, record) => record.periods[5] || '-' },
        { title: 'Period 7', render: (_, record) => record.periods[6] || '-' },
    ];

    return (
        <Content style={{ padding: '20px' }}>
            <h2>My Timetable ({user?.department})</h2>
            <Card>
                <Table dataSource={tableData} columns={columns} pagination={false} bordered />
            </Card>
        </Content>
    );
};

export default TimetablePage;
