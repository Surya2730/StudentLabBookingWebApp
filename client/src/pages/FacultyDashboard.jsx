import React, { useState, useEffect, useContext } from 'react';
import { Layout, Card, Button, Table, Modal, Form, Input, DatePicker, TimePicker, InputNumber, message, Tag, Tabs, Select } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import moment from 'moment';

const { Content } = Layout;
const { TabPane } = Tabs;
const { Option } = Select;

const FacultyDashboard = () => {
    const { user } = useContext(AuthContext);
    const [slots, setSlots] = useState([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [generatedOTP, setGeneratedOTP] = useState(null);
    const [form] = Form.useForm();

    const [otpTimer, setOtpTimer] = useState(0);

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        if (user) {
            fetchSlots();
        }
    }, [user]);

    const fetchSlots = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/slots/my-slots`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSlots(data);
        } catch (error) {
            message.error('Failed to fetch slots');
        }
    };

    const handleCreateSlot = async (values) => {
        try {
            const payload = {
                ...values,
                date: values.date.format('YYYY-MM-DD'),
                startTime: values.startTime.format('HH:mm'),
                endTime: values.endTime.format('HH:mm'),
            };
            await axios.post(`${API_URL}/slots`, payload, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            message.success('Slot created successfully');
            setIsModalVisible(false);
            form.resetFields();
            fetchSlots();
        } catch (error) {
            message.error(error.response?.data?.message || 'Error creating slot');
        }
    };

    const handleViewBookings = async (slot) => {
        setSelectedSlot(slot);
        setGeneratedOTP(null);
        try {
            const { data } = await axios.get(`${API_URL}/bookings/slot/${slot._id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBookings(data);
        } catch (error) {
            message.error('Failed to fetch bookings');
        }
    };

    const generateOTP = async () => {
        if (!selectedSlot) return;
        try {
            const { data } = await axios.post(`${API_URL}/attendance/generate-otp`, { slotId: selectedSlot._id }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setGeneratedOTP(data);
            setOtpTimer(15);

            // Countdown Timer
            const timer = setInterval(() => {
                setOtpTimer((prev) => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        setGeneratedOTP(null); // Clear OTP when timer hits 0
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (error) {
            message.error('Failed to generate OTP');
        }
    };

    const updateMarks = async (bookingId, marks) => {
        try {
            await axios.post(`${API_URL}/attendance/marks`, { bookingId, marks }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            message.success('Marks updated');
            // Refresh bookings
            handleViewBookings(selectedSlot);
        } catch (error) {
            message.error('Failed to update marks');
        }
    };

    const handleDeleteSlot = async (slotId) => {
        if (window.confirm('Are you sure you want to delete this slot?')) {
            try {
                await axios.delete(`${API_URL}/slots/${slotId}`, {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                message.success('Slot deleted');
                fetchSlots();
                setSelectedSlot(null); // Clear selection if deleted
            } catch (error) {
                message.error('Failed to delete slot');
            }
        }
    };

    const columns = [
        { title: 'Date', dataIndex: 'date', render: (text) => new Date(text).toDateString() },
        { title: 'Time', render: (text, record) => `${record.startTime} - ${record.endTime}` },
        { title: 'Lab Name', render: (text, record) => `${record.labName} (${record.department})` }, // Show Dept
        { title: 'Seats', render: (text, record) => `${record.bookedCount} / ${record.seatCapacity}` },
        {
            title: 'Action',
            render: (text, record) => (
                <>
                    <Button onClick={() => handleViewBookings(record)} style={{ marginRight: 10 }}>Manage</Button>
                    <Button danger onClick={() => handleDeleteSlot(record._id)}>Delete</Button>
                </>
            )
        }
    ];

    const bookingColumns = [
        { title: 'Student Name', dataIndex: ['studentId', 'name'] },
        { title: 'Email', dataIndex: ['studentId', 'email'] },
        {
            title: 'Attendance',
            dataIndex: 'attendanceStatus',
            render: (status) => (
                <Tag color={status === 'Present' ? 'green' : 'orange'}>{status}</Tag>
            )
        },
        {
            title: 'Marks',
            key: 'marks',
            render: (text, record) => (
                <InputNumber
                    defaultValue={record.marks}
                    onBlur={(e) => updateMarks(record._id, e.target.value)}
                />
            )
        }
    ];

    return (
        <Content className="layout-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                <h2>Faculty Dashboard</h2>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalVisible(true)}>
                    Create Lab Slot
                </Button>
            </div>

            <Table dataSource={slots} columns={columns} rowKey="_id" />

            {selectedSlot && (
                <Card style={{ marginTop: 20 }} title={`Manage: ${selectedSlot.labName} (${new Date(selectedSlot.date).toDateString()})`}>
                    <div style={{ marginBottom: 20 }}>
                        <Button
                            type="primary"
                            icon={<ReloadOutlined />}
                            onClick={generateOTP}
                            style={{ marginRight: 20 }}
                        >
                            Generate Attendance OTP
                        </Button>
                        {generatedOTP && (
                            <Tag color="blue" style={{ fontSize: '18px', padding: '5px 10px' }}>
                                OTP: {generatedOTP.code} (Expires in {otpTimer}s)
                            </Tag>
                        )}
                    </div>
                    <Table dataSource={bookings} columns={bookingColumns} rowKey="_id" pagination={false} />
                </Card>
            )}

            <Modal title="Create Lab Slot" open={isModalVisible} onCancel={() => setIsModalVisible(false)} footer={null}>
                <Form form={form} layout="vertical" onFinish={handleCreateSlot}>
                    <Form.Item name="labName" label="Lab Name" rules={[{ required: true }]}>
                        <Input />
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
                    <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="endTime" label="End Time" rules={[{ required: true }]}>
                        <TimePicker format="HH:mm" style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="seatCapacity" label="Capacity" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>Create</Button>
                </Form>
            </Modal>
        </Content>
    );
};

export default FacultyDashboard;
