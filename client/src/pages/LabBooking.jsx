import React, { useState, useEffect, useContext } from 'react';
import { Layout, Button, Table, Modal, Tabs, message, Input, Tag } from 'antd';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const { Content } = Layout;
const { TabPane } = Tabs;

const LabBooking = () => {
    const { user } = useContext(AuthContext);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
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

    const handleMarkLabAttendance = async () => {
        // NOTE: This uses the OLD route for Lab Slots
        // Depending on backend implementation, this might need check
        try {
            await axios.post(`${API_URL}/attendance/submit-otp`, {
                slotId: currentSlotId,
                otp
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            message.success('Lab Attendance marked present');
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
        <Content style={{ padding: '20px' }}>
            <h2>Lab Machine Booking</h2>
            <Tabs defaultActiveKey="1">
                <TabPane tab="Available Slots" key="1">
                    <Table dataSource={availableSlots} columns={slotsColumns} rowKey="_id" />
                </TabPane>
                <TabPane tab="My Bookings" key="2">
                    <Table dataSource={myBookings} columns={myBookingsColumns} rowKey="_id" />
                </TabPane>
            </Tabs>

            <Modal title="Enter Lab OTP" open={otpModalVisible} onOk={handleMarkLabAttendance} onCancel={() => setOtpModalVisible(false)}>
                <p>Enter the OTP provided by faculty for this lab session:</p>
                <Input value={otp} onChange={(e) => setOtp(e.target.value)} maxLength={6} />
            </Modal>
        </Content>
    );
};

export default LabBooking;
