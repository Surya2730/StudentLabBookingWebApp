import React, { useState, useEffect, useContext } from 'react';
import { Layout, Card, Button, Table, Modal, Tabs, message, Input, Tag } from 'antd';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const { Content } = Layout;
const { TabPane } = Tabs;

const StudentDashboard = () => {
    const { user } = useContext(AuthContext);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [currentBookingId, setCurrentBookingId] = useState(null);
    const [currentSlotId, setCurrentSlotId] = useState(null);
    const [otp, setOtp] = useState('');

    const API_URL = 'http://localhost:5000/api';

    useEffect(() => {
        if (user) {
            fetchAvailableSlots();
            fetchMyBookings();
        }
    }, [user]);

    const fetchAvailableSlots = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/slots`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            // Filter out slots that are full? Or show them as full? 
            // Also logic to filter out past slots could be good but keeping simple.
            setAvailableSlots(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const { data } = await axios.get(`${API_URL}/bookings/my-bookings`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setMyBookings(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBookSlot = async (slotId) => {
        try {
            await axios.post(`${API_URL}/bookings`, { slotId }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            message.success('Slot booked successfully! Check your email.');
            fetchAvailableSlots();
            fetchMyBookings();
        } catch (error) {
            message.error(error.response?.data?.message || 'Booking failed');
        }
    };

    const handleMarkAttendance = async () => {
        try {
            await axios.post(`${API_URL}/attendance/submit-otp`, {
                slotId: currentSlotId,
                otp
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            message.success('Attendance marked present');
            setOtpModalVisible(false);
            setOtp('');
            fetchMyBookings();
        } catch (error) {
            message.error(error.response?.data?.message || 'Attendance failed');
        }
    };

    const openOtpModal = (slotId) => {
        setCurrentSlotId(slotId);
        setOtpModalVisible(true);
    };

    const slotsColumns = [
        { title: 'Date', dataIndex: 'date', render: (text) => new Date(text).toDateString() },
        { title: 'Time', render: (text, record) => `${record.startTime} - ${record.endTime}` },
        { title: 'Lab', dataIndex: 'labName' },
        { title: 'Availability', render: (text, record) => `${record.seatCapacity - record.bookedCount} / ${record.seatCapacity} seats left` },
        {
            title: 'Action',
            render: (text, record) => {
                const isBooked = myBookings.some(booking => booking.slotId._id === record._id);
                return (
                    <Button
                        type="primary"
                        disabled={record.bookedCount >= record.seatCapacity || isBooked}
                        onClick={() => handleBookSlot(record._id)}
                    >
                        {isBooked ? 'Booked' : (record.bookedCount >= record.seatCapacity ? 'Full' : 'Book')}
                    </Button>
                );
            }
        }
    ];

    const myBookingsColumns = [
        { title: 'Date', render: (text, record) => new Date(record.slotId.date).toDateString() },
        { title: 'Lab', render: (text, record) => record.slotId.labName },
        {
            title: 'Status',
            dataIndex: 'attendanceStatus',
            render: (status) => (
                <Tag color={status === 'Present' ? 'green' : 'orange'}>{status}</Tag>
            )
        },
        {
            title: 'Marks',
            dataIndex: 'marks',
            render: (marks) => marks !== null ? marks : 'N/A'
        },
        {
            title: 'Action',
            render: (text, record) => (
                <Button
                    disabled={record.attendanceStatus === 'Present'}
                    onClick={() => openOtpModal(record.slotId._id)}
                >
                    Mark Attendance
                </Button>
            )
        }
    ];

    return (
        <Content className="layout-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>Student Dashboard</h2>
                <Tag color="geekblue" style={{ fontSize: '14px', padding: '5px' }}>
                    Department: {user?.department || 'Unknown'}
                </Tag>
            </div>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Available Slots" key="1">
                    <Table dataSource={availableSlots} columns={slotsColumns} rowKey="_id" />
                </TabPane>
                <TabPane tab="My Bookings" key="2">
                    <Table dataSource={myBookings} columns={myBookingsColumns} rowKey="_id" />
                </TabPane>
            </Tabs>

            <Modal title="Enter OTP" open={otpModalVisible} onOk={handleMarkAttendance} onCancel={() => setOtpModalVisible(false)}>
                <p>Enter the 6-digit OTP provided by faculty:</p>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
            </Modal>
        </Content>
    );
};

export default StudentDashboard;
