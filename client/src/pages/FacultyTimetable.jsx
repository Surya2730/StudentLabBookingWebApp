import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, Select, Button, Table, Typography, message, Row, Col, Empty } from 'antd';
import { SearchOutlined, CalendarOutlined, TableOutlined } from '@ant-design/icons';
import axios from '../services/api';
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

    if (!user) return null;

    // Role Guard
    if (user.role !== 'faculty' && user.role !== 'admin') {
        return <Navigate to="/student-dashboard" replace />;
    }

    const fetchTimetable = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/timetable', {
                params: { department: selectedDept, year: selectedYear, semester: selectedSem }
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
                    background: record.periods[i] ? 'var(--primary-bg)' : 'transparent',
                    borderRadius: '4px',
                    textAlign: 'center',
                    minWidth: '100px',
                    color: record.periods[i] ? 'var(--primary-dark)' : 'var(--text-tertiary)'
                }}>
                    {record.periods[i] || '-'}
                </div>
            )
        }))
    ];

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <Title level={2}>Timetable Viewer</Title>
                <Text type="secondary">View class schedules across departments.</Text>
            </div>

            <Card className="card-modern" style={{ marginBottom: '24px' }}>
                <Row gutter={[16, 16]} align="bottom">
                    <Col xs={24} sm={8} md={6}>
                        <Text strong>Department</Text>
                        <Select style={{ width: '100%', marginTop: 6 }} value={selectedDept} onChange={setSelectedDept} size="large">
                            <Option value="CSE">CSE</Option>
                            <Option value="ECE">ECE</Option>
                            <Option value="EEE">EEE</Option>
                        </Select>
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Text strong>Year</Text>
                        <Select style={{ width: '100%', marginTop: 6 }} value={selectedYear} onChange={setSelectedYear} size="large">
                            <Option value={1}>1</Option>
                            <Option value={2}>2</Option>
                            <Option value={3}>3</Option>
                            <Option value={4}>4</Option>
                        </Select>
                    </Col>
                    <Col xs={12} sm={8} md={4}>
                        <Text strong>Semester</Text>
                        <Select style={{ width: '100%', marginTop: 6 }} value={selectedSem} onChange={setSelectedSem} size="large">
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
                            size="large"
                            style={{ height: '40px' }}
                        >
                            View Timetable
                        </Button>
                    </Col>
                </Row>
            </Card>

            {timetable ? (
                <Card className="card-modern" title={<><TableOutlined /> {timetable.department} - Year {timetable.year} Schedule</>}>
                    <Table
                        dataSource={tableData}
                        columns={columns}
                        pagination={false}
                        bordered
                        scroll={{ x: true }}
                    />
                </Card>
            ) : (
                <div style={{ textAlign: 'center', padding: '60px 0', background: '#fff', borderRadius: '12px', border: '1px dashed var(--border-color)' }}>
                    <CalendarOutlined style={{ fontSize: '48px', color: 'var(--text-tertiary)', marginBottom: '16px' }} />
                    <Title level={4} style={{ color: 'var(--text-secondary)' }}>Select criteria to view timetable</Title>
                </div>
            )}
        </div>
    );
};

export default FacultyTimetable;
