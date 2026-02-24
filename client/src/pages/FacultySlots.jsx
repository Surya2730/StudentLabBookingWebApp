import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, Button, Table, Modal, Form, Input, DatePicker, TimePicker, InputNumber, message, Tag, Typography, Breadcrumb, Select, Row, Col, Divider, Empty, Tooltip, Checkbox } from 'antd';
import { PlusOutlined, ExperimentOutlined, TeamOutlined, QrcodeOutlined, DeleteOutlined, CalendarOutlined, ClockCircleOutlined, SaveOutlined } from '@ant-design/icons';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';

const { Title, Text } = Typography;
const { Option } = Select;

const PERIODS = [
    { id: 1, label: 'Period 1 (08:45-09:35)', start: '08:45', end: '09:35' },
    { id: 2, label: 'Period 2 (09:35-10:25)', start: '09:35', end: '10:25' },
    { id: 3, label: 'Period 3 (10:40-11:30)', start: '10:40', end: '11:30' },
    { id: 4, label: 'Period 4 (11:30-12:20)', start: '11:30', end: '12:20' },
    { id: 5, label: 'Period 5 (13:30-14:20)', start: '13:30', end: '14:20' },
    { id: 6, label: 'Period 6 (14:20-15:10)', start: '14:20', end: '15:10' },
    { id: 7, label: 'Period 7 (15:25-16:30)', start: '15:25', end: '16:30' }
];

const FacultySlots = () => {
    const { user } = useContext(AuthContext);
    const [slots, setSlots] = useState([]);
    const [isSlotModalVisible, setIsSlotModalVisible] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [slotForm] = Form.useForm();
    const [marksLoading, setMarksLoading] = useState({});
    const [category, setCategory] = useState('upcoming');

    useEffect(() => {
        if (user) fetchSlots();
    }, [user]);

    if (!user) return null;

    // Role Guard
    if (user.role !== 'faculty' && user.role !== 'admin') {
        return <Navigate to="/student-dashboard" replace />;
    }

    const fetchSlots = async () => {
        try {
            const { data } = await axios.get('/slots/my-slots');
            setSlots(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateSlot = async (values) => {
        // Logic to support selecting periods (Max 2)
        // Values.periods is array of IDs e.g. [1] or [1,2]
        // Currently we map first period start to last period end.
        try {
            const periods = values.periods.sort((a, b) => a - b);
            if (periods.length === 0) return;

            const startP = PERIODS.find(p => p.id === periods[0]);
            const endP = PERIODS.find(p => p.id === periods[periods.length - 1]);

            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
                startTime: startP.start,
                endTime: endP.end,
            };
            await axios.post('/slots', payload);
            message.success('Slot created successfully');
            setIsSlotModalVisible(false);
            slotForm.resetFields();
            fetchSlots();
        } catch (error) {
            message.error('Error creating slot');
        }
    };

    const handleViewBookings = async (slot) => {
        setSelectedSlot(slot);
        try {
            const { data } = await axios.get(`/bookings/slot/${slot._id}`);
            setBookings(data);
            setTimeout(() => {
                document.getElementById('management-section')?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        } catch (error) {
            console.error('Failed to fetch bookings');
        }
    };

    const handleUpdateMark = async (bookingId, marks) => {
        setMarksLoading(prev => ({ ...prev, [bookingId]: true }));
        try {
            await axios.put(`/bookings/${bookingId}/marks`, { marks });
            message.success('Marks updated');
            // Refresh bookings to reflect state if needed
        } catch (error) {
            message.error('Failed to save marks');
        } finally {
            setMarksLoading(prev => ({ ...prev, [bookingId]: false }));
        }
    };

    const renderSlotCard = (slot) => (
        <Col xs={24} md={12} lg={8} key={slot._id}>
            <Card
                className="card-modern"
                hoverable
                onClick={() => handleViewBookings(slot)}
                style={{ cursor: 'pointer', border: selectedSlot?._id === slot._id ? '2px solid var(--primary-color)' : '' }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Title level={5} style={{ margin: 0 }}>{slot.labName}</Title>
                    <Tag color="cyan">{slot.department}</Tag>
                </div>
                <Divider style={{ margin: '12px 0' }} />
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <span><CalendarOutlined /> {new Date(slot.date).toDateString()}</span>
                    <span><ClockCircleOutlined /> {slot.startTime} - {slot.endTime}</span>
                    <span><TeamOutlined /> Bookings: {slot.bookedCount} / {slot.seatCapacity}</span>
                </div>
            </Card>
        </Col>
    );

    return (
        <div className="page-container">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <Title level={2}>Lab Slots</Title>
                    <Text type="secondary">Create and manage your lab sessions.</Text>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-end' }}>
                    <div style={{ minWidth: '200px' }}>
                        <Text strong style={{ display: 'block', marginBottom: '8px' }}>Categorize Labs</Text>
                        <Select value={category} onChange={setCategory} style={{ width: '100%' }} size="large">
                            <Select.Option value="upcoming">Upcoming Labs</Select.Option>
                            <Select.Option value="past">Past Labs</Select.Option>
                            <Select.Option value="all">All Labs</Select.Option>
                        </Select>
                    </div>
                    <Button
                        type="primary"
                        size="large"
                        icon={<PlusOutlined />}
                        onClick={() => setIsSlotModalVisible(true)}
                    >
                        Create Slot
                    </Button>
                </div>
            </div>

            <Row gutter={[24, 24]}>
                {(() => {
                    const filtered = slots.filter(slot => {
                        const slotDate = new Date(slot.date);
                        const now = new Date();
                        // Reset time for date comparison if needed, but for slots usually date is enough
                        // For a robust check:
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        slotDate.setHours(0, 0, 0, 0);

                        if (category === 'upcoming') return slotDate >= today;
                        if (category === 'past') return slotDate < today;
                        return true;
                    });

                    return filtered.length > 0 ? filtered.map(renderSlotCard) : (
                        <Col span={24}>
                            <Empty description={`No ${category} slots found.`} />
                        </Col>
                    );
                })()}
            </Row>

            {selectedSlot && (
                <div id="management-section" style={{ marginTop: '40px', animation: 'fadeIn 0.5s' }}>
                    <Card className="card-modern" title={
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <span><ExperimentOutlined /> Managing: {selectedSlot.labName}</span>
                            <Button size="small" onClick={() => setSelectedSlot(null)}>Close</Button>
                        </div>
                    }>
                        <Row gutter={[24, 24]}>
                            {/* OTP Generation moved to Home Page as per request */}

                            <Col span={24}>
                                <Title level={5} style={{ marginBottom: '16px' }}>Booked Students ({bookings.length})</Title>
                                <Table
                                    dataSource={bookings}
                                    rowKey="_id"
                                    pagination={{ pageSize: 10 }}
                                    columns={[
                                        { title: 'Name', dataIndex: ['studentId', 'name'] },
                                        { title: 'Email', dataIndex: ['studentId', 'email'] },
                                        {
                                            title: 'Status',
                                            dataIndex: 'attendanceStatus',
                                            render: (status) => (
                                                <Tag color={status === 'Present' ? 'green' : 'volcano'}>
                                                    {status.toUpperCase()}
                                                </Tag>
                                            )
                                        },
                                        {
                                            title: 'Marks',
                                            dataIndex: 'marks',
                                            render: (marks, record) => (
                                                <InputNumber
                                                    defaultValue={marks}
                                                    min={0}
                                                    max={100}
                                                    onBlur={(e) => handleUpdateMark(record._id, e.target.value)}
                                                    onPressEnter={(e) => handleUpdateMark(record._id, e.target.value)}
                                                    disabled={marksLoading[record._id]}
                                                />
                                            )
                                        }
                                    ]}
                                />
                            </Col>
                        </Row>
                    </Card>
                </div>
            )}

            <Modal
                title="Create New Lab Slot"
                open={isSlotModalVisible}
                onCancel={() => setIsSlotModalVisible(false)}
                footer={null}
                centered
            >
                <Form form={slotForm} layout="vertical" onFinish={handleCreateSlot}>
                    <Form.Item name="labName" label="Lab Name" rules={[{ required: true }]}>
                        <Input placeholder="e.g. Advanced Java Lab" />
                    </Form.Item>
                    <Form.Item name="department" label="Department" rules={[{ required: true }]} initialValue="CSE">
                        <Select>
                            <Option value="CSE">CSE</Option>
                            <Option value="ECE">ECE</Option>
                            <Option value="EEE">EEE</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="date" label="Date" rules={[{ required: true }]}>
                        <DatePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item
                        name="periods"
                        label="Select Periods (Max 2)"
                        rules={[
                            { required: true, message: 'Select at least one period' },
                            { type: 'array', max: 2, message: 'Maximum 2 periods allowed' }
                        ]}
                    >
                        <Checkbox.Group style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {PERIODS.map(p => (
                                <Checkbox key={p.id} value={p.id}>{p.label}</Checkbox>
                            ))}
                        </Checkbox.Group>
                    </Form.Item>

                    <Form.Item name="seatCapacity" label="Capacity" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block size="large">Create Slot</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default FacultySlots;
