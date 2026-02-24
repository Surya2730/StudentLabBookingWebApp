import React, { useState, useEffect, useContext } from 'react';
import { Layout, Button, Tabs, Modal, Input, Tag, Card, Row, Col, Typography, Empty, Badge, message, Select } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, EnvironmentOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const LabBooking = () => {
    const { user } = useContext(AuthContext);
    const [availableSlots, setAvailableSlots] = useState([]);
    const [myBookings, setMyBookings] = useState([]);
    const [otpModalVisible, setOtpModalVisible] = useState(false);
    const [currentSlotId, setCurrentSlotId] = useState(null);
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [category, setCategory] = useState('upcoming');

    useEffect(() => {
        if (user) {
            fetchAvailableSlots();
            fetchMyBookings();
        }
    }, [user]);

    const fetchAvailableSlots = async () => {
        setLoading(true);
        try {
            const { data } = await axios.get('/slots');
            setAvailableSlots(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMyBookings = async () => {
        try {
            const { data } = await axios.get('/bookings/my-bookings');
            setMyBookings(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleBookSlot = async (slotId) => {
        try {
            await axios.post('/bookings', { slotId });
            message.success({ content: 'Slot booked successfully!', icon: <CheckCircleOutlined style={{ color: 'var(--success-color)' }} /> });
            fetchAvailableSlots();
            fetchMyBookings();
        } catch (error) {
            message.error(error.response?.data?.message || 'Booking failed');
        }
    };

    const handleMarkLabAttendance = async () => {
        try {
            await axios.post('/attendance/submit-otp', {
                slotId: currentSlotId,
                otp
            });
            message.success('Attendance marked successfully!');
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

    const isSlotBookedByMe = (slotId) => myBookings.some(b => b.slotId._id === slotId);

    const renderSlotCard = (slot) => {
        const isBooked = isSlotBookedByMe(slot._id);
        const isFull = slot.bookedCount >= slot.seatCapacity;
        const availableSeats = slot.seatCapacity - slot.bookedCount;

        return (
            <Col xs={24} sm={12} lg={8} key={slot._id}>
                <Badge.Ribbon
                    text={isBooked ? "Booked" : (isFull ? "Full" : "Available")}
                    color={isBooked ? "green" : (isFull ? "red" : "blue")}
                >
                    <Card className="card-modern" hoverable style={{ height: '100%' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ marginBottom: '16px' }}>
                                <Title level={4} style={{ marginBottom: '4px', color: 'var(--primary-dark)' }}>{slot.labName}</Title>
                                <Tag color="geekblue">{slot.department}</Tag>
                            </div>

                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)' }}>
                                <span><CalendarOutlined /> {new Date(slot.date).toDateString()}</span>
                                <span><ClockCircleOutlined /> {slot.startTime} - {slot.endTime}</span>
                                <span><EnvironmentOutlined /> {availableSeats} / {slot.seatCapacity} seats left</span>
                            </div>

                            <Button
                                type="primary"
                                block
                                style={{ marginTop: '20px' }}
                                disabled={isBooked || isFull}
                                onClick={() => handleBookSlot(slot._id)}
                            >
                                {isBooked ? 'Already Booked' : (isFull ? 'Slot Full' : 'Book Now')}
                            </Button>
                        </div>
                    </Card>
                </Badge.Ribbon>
            </Col>
        );
    };

    const renderMyBookingCard = (booking) => (
        <Col xs={24} sm={12} lg={8} key={booking._id}>
            <Card className="card-modern" style={{ height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Title level={4}>{booking.slotId.labName}</Title>
                    <Tag color={booking.attendanceStatus === 'Present' ? 'green' : 'orange'}>
                        {booking.attendanceStatus}
                    </Tag>
                </div>
                <div style={{ margin: '16px 0', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <span><CalendarOutlined /> {new Date(booking.slotId.date).toDateString()}</span>
                    <span><ClockCircleOutlined /> {booking.slotId.startTime} - {booking.slotId.endTime}</span>
                </div>
                {booking.attendanceStatus !== 'Present' && (
                    <Button type="dashed" block onClick={() => openOtpModal(booking.slotId._id)}>
                        Mark Attendance
                    </Button>
                )}
            </Card>
        </Col>
    );

    return (
        <div className="page-container">
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: '16px' }}>
                <div>
                    <Title level={2}>Lab Booking</Title>
                    <Text type="secondary">Browse available lab slots and manage your bookings.</Text>
                </div>
                <div style={{ minWidth: '200px' }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>Categorize Labs</Text>
                    <Select value={category} onChange={setCategory} style={{ width: '100%' }} size="large">
                        <Select.Option value="upcoming">Upcoming Labs</Select.Option>
                        <Select.Option value="past">Past Labs</Select.Option>
                        <Select.Option value="all">All Labs</Select.Option>
                    </Select>
                </div>
            </div>

            <Tabs defaultActiveKey="1" type="card" size="large">
                <TabPane tab={<span><CalendarOutlined /> Available Slots</span>} key="1">
                    {(() => {
                        const filtered = availableSlots.filter(slot => {
                            const slotDate = new Date(slot.date);
                            const now = new Date();
                            if (category === 'upcoming') return slotDate >= now;
                            if (category === 'past') return slotDate < now;
                            return true;
                        });

                        return filtered.length > 0 ? (
                            <Row gutter={[24, 24]}>
                                {filtered.map(renderSlotCard)}
                            </Row>
                        ) : (
                            <Empty description={`No ${category} slots available`} image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        );
                    })()}
                </TabPane>
                <TabPane tab={<span><CheckCircleOutlined /> My Bookings</span>} key="2">
                    {myBookings.length > 0 ? (
                        <Row gutter={[24, 24]}>
                            {myBookings.map(renderMyBookingCard)}
                        </Row>
                    ) : (
                        <Empty description="You haven't booked any slots yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    )}
                </TabPane>
            </Tabs>

            <Modal
                title="Enter Lab OTP"
                open={otpModalVisible}
                onOk={handleMarkLabAttendance}
                onCancel={() => setOtpModalVisible(false)}
                okText="Submit OTP"
            >
                <p style={{ marginBottom: '12px' }}>Enter the OTP provided by the faculty to mark your attendance.</p>
                <Input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    maxLength={6}
                    placeholder="e.g. 123456"
                    style={{ fontSize: '18px', textAlign: 'center', letterSpacing: '4px' }}
                />
            </Modal>
        </div>
    );
};

export default LabBooking;
