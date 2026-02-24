import React, { useState, useEffect, useContext } from 'react';
import { Layout, Card, Descriptions, List, Avatar, Tag, Row, Col, Typography, Divider } from 'antd';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';
import { TrophyOutlined, UserOutlined, MailOutlined, NumberOutlined, BookOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import { Form, Input, InputNumber, Modal, Button, message } from 'antd';

const { Title, Text } = Typography;

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);
    const [isEditModalVisible, setIsEditModalVisible] = useState(false);
    const [editForm] = Form.useForm();

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get('/profile/me');
                setProfile(data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                const { data } = await axios.get('/profile/leaderboard');
                setLeaderboard(data);
            } catch (error) {
                console.error(error);
            }
        };

        if (user) {
            fetchProfile();
            fetchLeaderboard();
        }
    }, [user]);

    const handleUpdateProfile = async (values) => {
        try {
            const { data } = await axios.put('/profile/me', values);
            setProfile(prev => ({ ...prev, ...data }));
            message.success('Profile updated successfully');
            setIsEditModalVisible(false);
        } catch (error) {
            message.error('Failed to update profile');
        }
    };

    return (
        <div className="page-container">
            <Row gutter={[32, 32]}>
                {/* Profile Details Column */}
                <Col xs={24} lg={14}>
                    <Card
                        className="card-modern"
                        title={<Title level={4} style={{ margin: 0 }}>Academic Profile</Title>}
                        extra={
                            <Button
                                type="primary"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    editForm.setFieldsValue({
                                        rollNumber: profile?.rollNumber,
                                        year: profile?.year,
                                        cgpa: profile?.cgpa
                                    });
                                    setIsEditModalVisible(true);
                                }}
                            >
                                Edit Profile
                            </Button>
                        }
                    >
                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '24px', gap: '20px' }}>
                            <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: 'var(--primary-color)' }} />
                            <div>
                                <Title level={3} style={{ margin: 0 }}>{profile?.user?.name}</Title>
                                <Tag color="blue">{profile?.user?.department}</Tag>
                            </div>
                        </div>

                        <Divider />

                        <Descriptions column={1} labelStyle={{ fontWeight: 'bold', width: '140px' }}>
                            <Descriptions.Item label={<><MailOutlined /> Email</>}>{profile?.user?.email}</Descriptions.Item>
                            <Descriptions.Item label={<><NumberOutlined /> Roll Number</>}>{profile?.rollNumber}</Descriptions.Item>
                            <Descriptions.Item label={<><UserOutlined /> Year / CGPA</>}>
                                Year {profile?.year || 1} • {profile?.cgpa || 0} CGPA
                            </Descriptions.Item>
                            <Descriptions.Item label={<><TrophyOutlined /> Reward Points</>}>
                                <span style={{ color: 'var(--success-color)', fontWeight: 600 }}>{profile?.rewardPoints}</span>
                            </Descriptions.Item>
                            <Descriptions.Item label={<><BookOutlined /> Activity Points</>}>
                                <span style={{ color: 'var(--info-color)', fontWeight: 600 }}>{profile?.activityPoints}</span>
                            </Descriptions.Item>
                        </Descriptions>

                        <Divider />

                        <Title level={5}>PS Levels Completed</Title>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px' }}>
                            {profile?.psLevels?.slice().reverse().map((level, idx) => (
                                <Tag color="geekblue" key={idx} style={{ padding: '6px 12px', fontSize: '14px', borderRadius: '4px' }}>
                                    <strong>{level.subject}</strong> · Level {level.level}
                                </Tag>
                            ))}
                            {(!profile?.psLevels || profile?.psLevels.length === 0) && <Text type="secondary">No levels completed yet.</Text>}
                        </div>
                    </Card>
                </Col>

                {/* Leaderboard Column */}
                <Col xs={24} lg={10}>
                    <Card
                        className="card-modern"
                        title={
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <TrophyOutlined style={{ color: 'gold', fontSize: '20px' }} />
                                <span style={{ fontWeight: 600 }}>Leaderboard (Top 20)</span>
                            </div>
                        }
                    >
                        <List
                            itemLayout="horizontal"
                            dataSource={leaderboard}
                            renderItem={(item, index) => {
                                const isTop3 = index < 3;
                                const rankColor = index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : index === 2 ? '#CD7F32' : 'transparent';
                                const avatarColor = isTop3 ? 'white' : 'var(--primary-light)';
                                const textColor = isTop3 ? 'black' : 'white';

                                return (
                                    <List.Item style={{ padding: '16px 0' }}>
                                        <List.Item.Meta
                                            avatar={
                                                <Avatar
                                                    style={{
                                                        backgroundColor: isTop3 ? rankColor : '#f0f2f5',
                                                        color: isTop3 ? '#fff' : '#666',
                                                        fontWeight: 'bold',
                                                        border: isTop3 ? 'none' : '1px solid #d9d9d9'
                                                    }}
                                                >
                                                    {index + 1}
                                                </Avatar>
                                            }
                                            title={<Text strong>{item.user?.name}</Text>}
                                            description={<Text type="secondary">{item.user?.department}</Text>}
                                        />
                                        <div style={{ textAlign: 'right' }}>
                                            <div style={{ fontWeight: 'bold', color: 'var(--primary-color)' }}>{item.rewardPoints}</div>
                                            <div style={{ fontSize: '10px', color: '#999' }}>POINTS</div>
                                        </div>
                                    </List.Item>
                                );
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            <Modal
                title="Edit Academic Profile"
                open={isEditModalVisible}
                onCancel={() => setIsEditModalVisible(false)}
                footer={null}
                centered
            >
                <Form form={editForm} layout="vertical" onFinish={handleUpdateProfile}>
                    <Form.Item name="rollNumber" label="Roll Number" rules={[{ required: true }]}>
                        <Input placeholder="e.g. 21CS001" />
                    </Form.Item>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="year" label="Year" rules={[{ required: true }]}>
                                <InputNumber min={1} max={4} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="cgpa" label="CGPA">
                                <InputNumber min={0} max={10} step={0.01} style={{ width: '100%' }} />
                            </Form.Item>
                        </Col>
                    </Row>
                    <Button type="primary" htmlType="submit" block size="large" icon={<SaveOutlined />}>
                        Save Profile
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default ProfilePage;
