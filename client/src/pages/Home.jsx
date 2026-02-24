import React, { useContext } from 'react';
import { Button, Typography, Row, Col, Card } from 'antd';
import {
    BookOutlined,
    TeamOutlined,
    CalendarOutlined,
    ThunderboltOutlined,
    ArrowRightOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;

const Home = () => {
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);

    const handleActionClick = () => {
        if (user) {
            if (user.role === 'faculty' || user.role === 'admin') {
                navigate('/faculty/home');
            } else {
                navigate('/student-dashboard');
            }
        } else {
            navigate('/login');
        }
    };

    return (
        <div style={{ background: '#fff' }}>
            {/* Hero Section */}
            <section style={{
                padding: '100px 20px',
                background: 'linear-gradient(135deg, var(--primary-bg) 0%, #ffffff 100%)',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ maxWidth: '1000px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: '#fff',
                        padding: '8px 16px',
                        borderRadius: '50px',
                        boxShadow: 'var(--shadow-md)',
                        marginBottom: '24px'
                    }}>
                        <ThunderboltOutlined style={{ color: 'var(--primary-color)' }} />
                        <Text strong style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            Next-Gen Campus Management
                        </Text>
                    </div>

                    <Title style={{ fontSize: 'clamp(2.5rem, 8vw, 4.5rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: '24px' }}>
                        {user ? (
                            <>Welcome back, <span style={{ color: 'var(--primary-color)' }}>{user.name}</span></>
                        ) : (
                            <>Lab Slot Booking <span style={{ color: 'var(--primary-color)' }}>Simplified.</span></>
                        )}
                    </Title>

                    <Text style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', display: 'block', maxWidth: '700px', margin: '0 auto 40px' }}>
                        Empowering students and faculty with seamless scheduling, real-time attendance, and automated reports. Experience the future of lab management today.
                    </Text>

                    <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <Button
                            type="primary"
                            size="large"
                            icon={<ArrowRightOutlined />}
                            style={{ height: '56px', padding: '0 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 600 }}
                            onClick={handleActionClick}
                        >
                            {user ? 'Go to Dashboard' : 'Get Started Now'}
                        </Button>
                        <Button
                            size="large"
                            style={{ height: '56px', padding: '0 32px', borderRadius: '12px', fontSize: '16px', fontWeight: 600 }}
                            onClick={() => {
                                const features = document.getElementById('features');
                                features?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            View Features
                        </Button>
                    </div>
                </div>

                {/* Decorative Elements */}
                <div style={{ position: 'absolute', top: '10%', left: '-5%', width: '300px', height: '300px', background: 'var(--primary-light)', opacity: 0.1, borderRadius: '50%', filter: 'blur(80px)' }}></div>
                <div style={{ position: 'absolute', bottom: '10%', right: '-5%', width: '400px', height: '400px', background: 'var(--secondary-color)', opacity: 0.1, borderRadius: '50%', filter: 'blur(100px)' }}></div>
            </section>

            {/* Features Section */}
            <section id="features" style={{ padding: '80px 20px', maxWidth: '1200px', margin: '0 auto' }}>
                <div style={{ textAlign: 'center', marginBottom: '60px' }}>
                    <Title level={2}>Everything you need</Title>
                    <Text type="secondary" style={{ fontSize: '1.1rem' }}>Designed for speed, reliability, and ease of use.</Text>
                </div>

                <Row gutter={[32, 32]}>
                    <Col xs={24} md={8}>
                        <Card className="card-modern" style={{ textAlign: 'center', padding: '20px' }} bordered={false}>
                            <div style={{ width: '64px', height: '64px', background: 'var(--primary-bg)', color: 'var(--primary-color)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>
                                <CalendarOutlined />
                            </div>
                            <Title level={4}>Smart Booking</Title>
                            <Paragraph style={{ color: 'var(--text-secondary)' }}>
                                Instant slot availability with department-specific filtering for students.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="card-modern" style={{ textAlign: 'center', padding: '20px' }} bordered={false}>
                            <div style={{ width: '64px', height: '64px', background: '#ecfdf5', color: 'var(--success-color)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>
                                <ThunderboltOutlined />
                            </div>
                            <Title level={4}>Secure OTP</Title>
                            <Paragraph style={{ color: 'var(--text-secondary)' }}>
                                Real-time attendance tracking with secure, time-expiring OTP codes.
                            </Paragraph>
                        </Card>
                    </Col>
                    <Col xs={24} md={8}>
                        <Card className="card-modern" style={{ textAlign: 'center', padding: '20px' }} bordered={false}>
                            <div style={{ width: '64px', height: '64px', background: '#eff6ff', color: 'var(--info-color)', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', fontSize: '28px' }}>
                                <TeamOutlined />
                            </div>
                            <Title level={4}>Faculty Tools</Title>
                            <Paragraph style={{ color: 'var(--text-secondary)' }}>
                                Comprehensive dashboard for faculty to manage sessions and student performance.
                            </Paragraph>
                        </Card>
                    </Col>
                </Row>
            </section>

            {/* Footer */}
            <footer style={{ borderTop: '1px solid var(--border-color)', padding: '40px 20px', textAlign: 'center' }}>
                <Title level={5} style={{ margin: 0, color: 'var(--text-secondary)' }}>LabBooking</Title>
                <Text type="secondary" style={{ fontSize: '14px' }}>© 2026 Student Lab Slot Booking System. All rights reserved.</Text>
            </footer>
        </div>
    );
};

// Simple Typography components since we are not importing Paragraph explicitly
const Paragraph = ({ children, style }) => <p style={{ fontSize: '1rem', ...style }}>{children}</p>;

export default Home;
