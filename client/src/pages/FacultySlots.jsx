import React, { useState, useEffect, useContext } from 'react';
import { Card, Button, Table, Modal, Form, Input, DatePicker, TimePicker, InputNumber, message, Tag, Typography, Breadcrumb, Select, Row, Col } from 'antd';
import { PlusOutlined, ExperimentOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

// Note: Not importing 'dayjs' here to avoid potential resolution errors if not installed. 
// Using native Dates or string manipulation if needed, or re-adding if confirmed available.
// Actually, earlier analysis showed moment usage in package.json. Let's stick to simple logic or assume standard imports.
// To be safe, I'll avoid external date libs for display if possible, or use standard Intl.DateTimeFormat.

const { Title } = Typography;
const { Option } = Select;

const FacultySlots = () => {
    const { user } = useContext(AuthContext);
    const [slots, setSlots] = useState([]);
    const [isSlotModalVisible, setIsSlotModalVisible] = useState(false);
    const [bookings, setBookings] = useState([]);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [labOtp, setLabOtp] = useState(null);
    const [slotForm] = Form.useForm();
    const API_URL = 'http://localhost:5000/api';

    // Safe Check
    if (!user) return <div style={{ padding: 20 }}>Loading...</div>;

    useEffect(() => {
        if (user) fetchSlots();
    }, [user]);

    const fetchSlots = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/slots/my-slots`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSlots(data);
        } catch (error) {
            // silent fail or weak warning
            console.error(error);
        }
    };

    const handleCreateSlot = async (values) => {
        try {
            // Handle Date/Time manually to ensure format
            // AntD DatePicker returns a dayjs/moment object usually
            const dateStr = values.date ? values.date.format('YYYY-MM-DD') : '';
            const startStr = values.startTime ? values.startTime.format('HH:mm') : '';
            const endStr = values.endTime ? values.endTime.format('HH:mm') : '';

            const payload = {
                ...values,
                date: dateStr,
                startTime: startStr,
                endTime: endStr,
            };
            await axios.post(`${API_URL}/slots`, payload, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
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
        setLabOtp(null);
        try {
            const { data } = await axios.get(`${API_URL}/bookings/slot/${slot._id}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setBookings(data);
        } catch (error) {
            console.error('Failed to fetch bookings');
        }
    };

    const generateLabOTP = async () => {
        if (!selectedSlot) return;
        try {
            const { data } = await axios.post(`${API_URL}/attendance/generate-otp`, {
                department: selectedSlot.department,
                period: 0 // Placeholder for Slot
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setLabOtp(data);
        } catch (error) {
            message.error('Failed to generate OTP');
        }
    };

    const columns = [
        { title: 'Date', dataIndex: 'date', render: (text) => new Date(text).toDateString() },
        { title: 'Lab Name', dataIndex: 'labName' },
        { title: 'Time', render: (_, r) => `${r.startTime} - ${r.endTime}` },
        { title: 'Dept', dataIndex: 'department', render: (text) => <Tag color="blue">{text}</Tag> },
        {
            title: 'Action',
            render: (text, record) => (
                <Button onClick={() => handleViewBookings(record)}>Manage</Button>
            )
        }
    ];

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100%' }}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <Title level={2} style={{ margin: 0 }}>Lab Slots</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setIsSlotModalVisible(true)}
                    size="large"
                    style={{ background: '#001529', borderColor: '#001529' }}
                >
                    Create Slot
                </Button>
            </div>

            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Table dataSource={slots} columns={columns} rowKey="_id" />
            </Card>

            {selectedSlot && (
                <Card
                    style={{ marginTop: 24, borderRadius: '8px', border: '1px solid #1890ff' }}
                    title={<span style={{ color: '#1890ff' }}><ExperimentOutlined /> Manage: {selectedSlot.labName} ({selectedSlot.department})</span>}
                >
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px' }}>
                        <Button type="primary" onClick={generateLabOTP}>Generate Slot OTP</Button>
                        {labOtp && (
                            <Tag color="green" style={{ marginLeft: 16, fontSize: '18px', padding: '5px 10px' }}>
                                OTP: {labOtp.code}
                            </Tag>
                        )}
                    </div>

                    <Table
                        style={{ marginTop: 10 }}
                        dataSource={bookings}
                        columns={[
                            { title: 'Student', dataIndex: ['studentId', 'name'] },
                            { title: 'Email', dataIndex: ['studentId', 'email'] },
                            {
                                title: 'Status',
                                dataIndex: 'attendanceStatus',
                                render: (status) => (
                                    <Tag color={status === 'Present' ? 'green' : 'red'}>
                                        {status}
                                    </Tag>
                                )
                            }
                        ]}
                        rowKey="_id"
                        pagination={false}
                    />
                </Card>
            )}

            <Modal title="Create Lab Slot" open={isSlotModalVisible} onCancel={() => setIsSlotModalVisible(false)} footer={null}>
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
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="startTime" label="Start Time" rules={[{ required: true }]}>
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="endTime" label="End Time" rules={[{ required: true }]}>
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Form.Item name="seatCapacity" label="Capacity" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block style={{ background: '#001529', borderColor: '#001529' }}>Create Slot</Button>
                </Form>
            </Modal>
        </div>
    );
};

export default FacultySlots;
