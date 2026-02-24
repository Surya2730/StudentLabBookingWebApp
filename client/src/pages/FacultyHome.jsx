import React, { useState, useContext, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, Button, Select, Tag, message, Typography, Row, Col, Progress, Radio, Divider } from 'antd';
import { ThunderboltOutlined, QrcodeOutlined, ClockCircleOutlined, ExperimentOutlined } from '@ant-design/icons';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';

const { Option } = Select;
const { Title, Text } = Typography;

const PERIODS = [
    { id: 1, label: 'Period 1', time: '08:45 - 09:35' },
    { id: 2, label: 'Period 2', time: '09:35 - 10:25' },
    { id: 3, label: 'Period 3', time: '10:40 - 11:30' },
    { id: 4, label: 'Period 4', time: '11:30 - 12:20' },
    { id: 5, label: 'Period 5', time: '13:30 - 14:20' },
    { id: 6, label: 'Period 6', time: '14:20 - 15:10' },
    { id: 7, label: 'Period 7', time: '15:25 - 16:30' }
];

const FacultyHome = () => {
    const { user } = useContext(AuthContext);

    const [otpType, setOtpType] = useState('class'); // 'class' or 'lab'
    const [classOtp, setClassOtp] = useState(null);
    const [classPeriod, setClassPeriod] = useState(null);
    const [classDept, setClassDept] = useState('CSE');
    const [selectedSlotId, setSelectedSlotId] = useState(null);
    const [labSlots, setLabSlots] = useState([]);

    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (user) {
            setClassDept(user.department || 'CSE');
            fetchActiveOTP();
            fetchMySlots();
        }
    }, [user]);

    // Timer Interval Logic
    useEffect(() => {
        if (timeLeft > 0) {
            const timerId = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(timerId);
        } else if (timeLeft === 0 && classOtp) {
            // Optional: Auto-clear OTP from view when expired
            // setClassOtp(null);
        }
    }, [timeLeft, classOtp]);

    const fetchActiveOTP = async () => {
        try {
            const { data } = await axios.get('/attendance/active-otp');
            if (data && data.expiresAt) {
                const expires = new Date(data.expiresAt).getTime();
                const now = new Date().getTime();
                const diff = Math.floor((expires - now) / 1000);

                if (diff > 0) {
                    setClassOtp(data);
                    setTimeLeft(diff);
                    if (data.metadata) {
                        if (data.metadata.slotId) {
                            setOtpType('lab');
                            setSelectedSlotId(data.metadata.slotId);
                        } else {
                            setOtpType('class');
                            setClassDept(data.metadata.department);
                            setClassPeriod(data.metadata.period);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Failed to fetch active OTP');
        }
    };

    const fetchMySlots = async () => {
        try {
            const { data } = await axios.get('/slots/my-slots');
            // Filter slots for today? Or just show all upcoming? Let's show all for now or today's.
            // For simplicity, showing all created slots to let them choose.
            // Ideally should filter by date === today.
            const today = new Date().toISOString().split('T')[0];
            const todaySlots = data.filter(s => s.date.startsWith(today));
            setLabSlots(todaySlots);
        } catch (error) {
            console.error("Failed to fetch slots");
        }
    };

    const generateOTP = async () => {
        setLoading(true);
        try {
            const payload = {};
            if (otpType === 'class') {
                payload.period = classPeriod;
                payload.department = classDept;
            } else {
                payload.slotId = selectedSlotId;
            }

            const { data } = await axios.post('/attendance/generate-otp', payload);
            setClassOtp(data);
            setTimeLeft(20); // Reset timer to 20 seconds
            message.success('Secure OTP Generated Successfully');
        } catch (error) {
            console.error(error);
            message.error('Failed to generate OTP');
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // Role Guard
    if (user.role !== 'faculty' && user.role !== 'admin') {
        return <Navigate to="/student-dashboard" replace />;
    }

    const isGenerateDisabled = () => {
        if (timeLeft > 0) return true;
        if (otpType === 'class') return !classPeriod || !classDept;
        if (otpType === 'lab') return !selectedSlotId;
        return true;
    };

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px' }}>
                <Title level={2}>Faculty Dashboard</Title>
                <Text type="secondary">Manage your classes and attendance efficiently.</Text>
            </div>

            <Row justify="center" gutter={[32, 32]}>
                <Col xs={24} md={12} lg={10}>
                    <Card
                        className="card-modern"
                        bordered={false}
                        cover={
                            <div style={{
                                height: '140px',
                                background: 'linear-gradient(135deg, var(--primary-color) 0%, var(--primary-dark) 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                flexDirection: 'column'
                            }}>
                                <QrcodeOutlined style={{ fontSize: '48px', marginBottom: '10px' }} />
                                <Title level={4} style={{ color: 'white', margin: 0 }}>Attendance Manager</Title>
                            </div>
                        }
                        bodyStyle={{ padding: '32px' }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

                            <div style={{ textAlign: 'center' }}>
                                <Radio.Group value={otpType} onChange={(e) => setOtpType(e.target.value)} buttonStyle="solid">
                                    <Radio.Button value="class">Regular Class</Radio.Button>
                                    <Radio.Button value="lab">Lab Slot</Radio.Button>
                                </Radio.Group>
                            </div>

                            <Divider style={{ margin: '0' }} />

                            {otpType === 'class' ? (
                                <>
                                    <div>
                                        <Text strong style={{ display: 'block', marginBottom: '8px' }}>Department</Text>
                                        <Select
                                            placeholder="Select Department"
                                            style={{ width: '100%' }}
                                            value={classDept}
                                            onChange={setClassDept}
                                            size="large"
                                        >
                                            <Option value="CSE">CSE</Option>
                                            <Option value="ECE">ECE</Option>
                                            <Option value="EEE">EEE</Option>
                                        </Select>
                                    </div>

                                    <div>
                                        <Text strong style={{ display: 'block', marginBottom: '8px' }}>Period</Text>
                                        <Select
                                            placeholder="Select Period"
                                            style={{ width: '100%' }}
                                            onChange={setClassPeriod}
                                            size="large"
                                            value={classPeriod}
                                        >
                                            {PERIODS.map(p => (
                                                <Option key={p.id} value={p.id}>
                                                    <span style={{ fontWeight: 500 }}>Period {p.id}</span>
                                                    <span style={{ color: '#999', marginLeft: '8px', fontSize: '13px' }}>({p.time})</span>
                                                </Option>
                                            ))}
                                        </Select>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>Select Active Lab Slot</Text>
                                    <Select
                                        placeholder="Select Today's Lab Slot"
                                        style={{ width: '100%', marginBottom: '8px' }}
                                        onChange={setSelectedSlotId}
                                        size="large"
                                        value={selectedSlotId}
                                    >
                                        {labSlots.map(slot => (
                                            <Option key={slot._id} value={slot._id}>
                                                {slot.labName} ({slot.startTime})
                                            </Option>
                                        ))}
                                    </Select>
                                    {labSlots.length === 0 && <Text type="secondary" style={{ fontSize: '12px' }}>No slots scheduled for today.</Text>}
                                </div>
                            )}

                            <Button
                                type="primary"
                                size="large"
                                onClick={generateOTP}
                                disabled={isGenerateDisabled()}
                                loading={loading}
                                icon={<ThunderboltOutlined />}
                                block
                                style={{ height: '50px', fontSize: '16px', fontWeight: 600, marginTop: '10px' }}
                            >
                                {timeLeft > 0 ? `Wait ${timeLeft}s` : 'Generate Secure OTP'}
                            </Button>

                            {classOtp && timeLeft > 0 && (
                                <div style={{
                                    marginTop: '20px',
                                    padding: '24px',
                                    background: 'var(--primary-bg)',
                                    border: '1px dashed var(--primary-color)',
                                    borderRadius: '12px',
                                    textAlign: 'center',
                                    animation: 'fadeIn 0.5s'
                                }}>
                                    <Text type="secondary">Share with students</Text>
                                    <div style={{
                                        fontSize: '56px',
                                        fontWeight: '800',
                                        color: 'var(--primary-color)',
                                        letterSpacing: '8px',
                                        lineHeight: 1.2,
                                        fontFamily: 'monospace'
                                    }}>
                                        {classOtp.code}
                                    </div>
                                    <div style={{ marginTop: '15px' }}>
                                        <Progress
                                            percent={(timeLeft / 20) * 100}
                                            showInfo={false}
                                            strokeColor="var(--primary-color)"
                                            trailColor="#e2e8f0"
                                            status="active"
                                        />
                                        <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-secondary)' }}>
                                            <ClockCircleOutlined />
                                            <span style={{ fontWeight: 600 }}>{timeLeft} seconds remaining</span>
                                        </div>
                                    </div>
                                    <Tag color="blue" style={{ marginTop: '12px' }}>
                                        {otpType === 'class' ? `Period ${classPeriod} Attendance` : 'Lab Slot Attendance'}
                                    </Tag>
                                </div>
                            )}

                            {classOtp && timeLeft === 0 && (
                                <div style={{ marginTop: '20px', textAlign: 'center', color: '#ff4d4f' }}>
                                    <Tag color="red">OTP Expired</Tag>
                                </div>
                            )}
                        </div>
                    </Card>
                </Col>

                <Col xs={24} md={12} lg={10}>
                    <Card className="card-modern" bordered={false} title="Quick Actions">
                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <Button type="default" icon={<ExperimentOutlined />} onClick={() => window.location.href = '/faculty/slots'}>Manage Slots</Button>
                            <Button type="default" icon={<QrcodeOutlined />} onClick={() => window.location.href = '/faculty/points'}>Update Points</Button>
                        </div>
                    </Card>

                    <Card className="card-modern" bordered={false} title="My Schedule (Today)" style={{ marginTop: '24px' }}>
                        <div style={{ textAlign: 'center', padding: '20px 0', color: 'var(--text-tertiary)' }}>
                            <ClockCircleOutlined style={{ fontSize: '24px', marginBottom: '10px' }} />
                            <p>Check "Timetable" for your full schedule.</p>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default FacultyHome;
