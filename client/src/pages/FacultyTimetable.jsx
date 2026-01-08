import React, { useState, useContext } from 'react';
import { Card, Select, Button, Table, Typography, message, Row, Col } from 'antd';
import { SearchOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;
const { Option } = Select;

const FacultyTimetable = () => {
    const { user } = useContext(AuthContext);
    const [selectedDept, setSelectedDept] = useState('CSE');
    const [selectedYear, setSelectedYear] = useState(1);
    const [selectedSem, setSelectedSem] = useState(1);
    const [timetable, setTimetable] = useState(null);
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    if (!user) return <div style={{ padding: 20 }}>Loading...</div>;

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            // Note: Current backend might only fetch by "my department". 
            // We might need to ensure the backend supports query params for generic fetch if not already.
            // Based on TimetablePage.jsx: axios.get(`.../timetable?department=${user.department}`)
            // We'll try to override the department in the query.
            const { data } = await axios.get(`${API_URL}/timetable`, {
                params: { department: selectedDept, year: selectedYear, semester: selectedSem },
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setTimetable(data);
            if (!data) message.info('No timetable found for this selection');
        } catch (error) {
            console.error(error);
            message.error('Failed to fetch timetable');
        } finally {
            setLoading(false);
        }
    };

    // Data Transformation for Table
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const tableData = days.map(day => ({
        key: day,
        day,
        periods: timetable?.schedule?.[day] || []
    }));

    const columns = [
        { title: 'Day', dataIndex: 'day', key: 'day', width: 100, fixed: 'left', render: (t) => <strong>{t}</strong> },
        { title: 'Period 1', render: (_, record) => record.periods[0] || '-' },
        { title: 'Period 2', render: (_, record) => record.periods[1] || '-' },
        { title: 'Period 3', render: (_, record) => record.periods[2] || '-' },
        { title: 'Period 4', render: (_, record) => record.periods[3] || '-' },
        { title: 'Period 5', render: (_, record) => record.periods[4] || '-' },
        { title: 'Period 6', render: (_, record) => record.periods[5] || '-' },
        { title: 'Period 7', render: (_, record) => record.periods[6] || '-' },
    ];

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100%' }}>
            <Title level={2} style={{ marginBottom: '24px' }}>Class Timetables</Title>

            <Card style={{ borderRadius: '8px', marginBottom: 24 }}>
                <Row gutter={16} align="bottom">
                    <Col xs={24} md={6}>
                        <Text strong>Department</Text>
                        <Select style={{ width: '100%', marginTop: 5 }} value={selectedDept} onChange={setSelectedDept}>
                            <Option value="CSE">CSE</Option>
                            <Option value="ECE">ECE</Option>
                            <Option value="EEE">EEE</Option>
                        </Select>
                    </Col>
                    <Col xs={12} md={4}>
                        <Text strong>Year</Text>
                        <Select style={{ width: '100%', marginTop: 5 }} value={selectedYear} onChange={setSelectedYear}>
                            <Option value={1}>1</Option>
                            <Option value={2}>2</Option>
                            <Option value={3}>3</Option>
                            <Option value={4}>4</Option>
                        </Select>
                    </Col>
                    <Col xs={12} md={4}>
                        <Text strong>Semester</Text>
                        <Select style={{ width: '100%', marginTop: 5 }} value={selectedSem} onChange={setSelectedSem}>
                            <Option value={1}>1</Option>
                            <Option value={2}>2</Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={6}>
                        <Button
                            type="primary"
                            icon={<SearchOutlined />}
                            onClick={fetchTimetable}
                            loading={loading}
                            block
                            style={{ background: '#001529', borderColor: '#001529' }}
                        >
                            View Timetable
                        </Button>
                    </Col>
                </Row>
            </Card>

            {timetable ? (
                <Card title={`Timetable: ${timetable.department} - Year ${timetable.year}`}>
                    <Table
                        dataSource={tableData}
                        columns={columns}
                        pagination={false}
                        bordered
                        scroll={{ x: true }}
                    />
                </Card>
            ) : (
                <div style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>
                    <CalendarOutlined style={{ fontSize: 48, marginBottom: 10 }} />
                    <p>Select criteria to view timetable</p>
                </div>
            )}
        </div>
    );
};

export default FacultyTimetable;
