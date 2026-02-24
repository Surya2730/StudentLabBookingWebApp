import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Card, Button, Input, List, Avatar, Modal, Form, InputNumber, message, Typography, Row, Col, Tag, Divider, Empty } from 'antd';
import { UserOutlined, TrophyOutlined, SearchOutlined, EditOutlined, StarOutlined } from '@ant-design/icons';
import axios from '../services/api';
import { AuthContext } from '../context/AuthContext';

const { Title, Text } = Typography;

const FacultyPoints = () => {
    const { user } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedStudents, setSearchedStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [pointsModalVisible, setPointsModalVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [pointsForm] = Form.useForm();

    useEffect(() => {
        if (user) handleSearchStudents();
    }, [user]);

    const handleSearchStudents = async (queryOverride) => {
        const q = queryOverride !== undefined ? queryOverride : searchQuery;
        setLoading(true);
        try {
            const { data } = await axios.get(`/profile/search?query=${q}`);
            setSearchedStudents(data);
        } catch (error) {
            message.error('Search failed');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdatePoints = async (values) => {
        try {
            await axios.put('/profile/update-points', {
                studentId: selectedStudent._id,
                ...values
            });
            message.success('Student Status Updated Successfully');
            setPointsModalVisible(false);
            pointsForm.resetFields();
            handleSearchStudents(); // Refresh list
        } catch (error) {
            message.error('Failed to update status');
        }
    };

    const [leaderboardVisible, setLeaderboardVisible] = useState(false);
    const [leaderboardData, setLeaderboardData] = useState([]);

    const fetchLeaderboard = async () => {
        try {
            const { data } = await axios.get('/profile/leaderboard');
            setLeaderboardData(data);
            setLeaderboardVisible(true);
        } catch (error) {
            message.error('Failed to fetch leaderboard');
        }
    };

    if (!user) return null;

    // Role Guard
    if (user.role !== 'faculty' && user.role !== 'admin') {
        return <Navigate to="/student-dashboard" replace />;
    }

    return (
        <div className="page-container">
            <div style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <Title level={2}>Manage Points</Title>
                    <Text type="secondary">Award points and update PS levels for students.</Text>
                </div>
                <Button icon={<TrophyOutlined />} onClick={fetchLeaderboard}>View Leaderboard</Button>
            </div>

            <Card className="card-modern" bordered={false}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={18}>
                        <Input
                            size="large"
                            placeholder="Search by Name or Email..."
                            prefix={<SearchOutlined style={{ color: 'var(--text-tertiary)' }} />}
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                handleSearchStudents(val);
                            }}
                            style={{ borderRadius: '8px' }}
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Button
                            type="primary"
                            size="large"
                            onClick={() => handleSearchStudents()}
                            block
                            icon={<SearchOutlined />}
                        >
                            Refresh List
                        </Button>
                    </Col>
                </Row>

                <div style={{ marginTop: '24px' }}>
                    <List
                        loading={loading}
                        itemLayout="horizontal"
                        dataSource={searchedStudents}
                        renderItem={item => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="primary"
                                        icon={<EditOutlined />}
                                        onClick={() => { setSelectedStudent(item); setPointsModalVisible(true); }}
                                    >
                                        Manage
                                    </Button>
                                ]}
                                style={{ padding: '16px', borderRadius: '8px', marginBottom: '8px', background: '#fff', border: '1px solid var(--border-color)' }}
                            >
                                <List.Item.Meta
                                    avatar={
                                        <Avatar
                                            size={48}
                                            icon={<UserOutlined />}
                                            style={{ backgroundColor: 'var(--primary-light)' }}
                                        />
                                    }
                                    title={<Text strong style={{ fontSize: '16px' }}>{item.name}</Text>}
                                    description={
                                        <div style={{ marginTop: '4px' }}>
                                            <div style={{ marginBottom: '8px', color: 'var(--text-secondary)' }}>
                                                {item.email} • <Tag color="blue">{item.department}</Tag>
                                            </div>
                                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                                                <Tag icon={<TrophyOutlined />} color="gold">Reward: {item.rewardPoints}</Tag>
                                                <Tag icon={<StarOutlined />} color="cyan">Activity: {item.activityPoints}</Tag>
                                                {item.psLevels && item.psLevels.length > 0 && (
                                                    <Tag color="purple">Latest: {item.psLevels[item.psLevels.length - 1].subject}</Tag>
                                                )}
                                            </div>
                                        </div>
                                    }
                                />
                            </List.Item>
                        )}
                        locale={{ emptyText: <Empty description="No students found" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    />
                </div>
            </Card>

            <Modal
                title={<span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><TrophyOutlined style={{ color: 'var(--warning-color)' }} /> Update Student Progress</span>}
                open={pointsModalVisible}
                onCancel={() => setPointsModalVisible(false)}
                footer={null}
                centered
            >
                <div style={{ marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                    <Text strong style={{ display: 'block', marginBottom: '8px' }}>History for {selectedStudent?.name}</Text>
                    {selectedStudent?.psLevels?.length > 0 ? (
                        <div style={{ maxHeight: '120px', overflowY: 'auto', display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {selectedStudent.psLevels.slice().reverse().map((l, i) => (
                                <Tag key={i} color="geekblue">{l.subject} (Lvl {l.level})</Tag>
                            ))}
                        </div>
                    ) : <Text type="secondary">No PS levels completed yet.</Text>}
                </div>

                <Form form={pointsForm} layout="vertical" onFinish={handleUpdatePoints}>
                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="rewardPoints" label="Reward Points">
                                <InputNumber style={{ width: '100%' }} min={0} placeholder="Add/Set Points" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="activityPoints" label="Activity Points">
                                <InputNumber style={{ width: '100%' }} min={0} placeholder="Add/Set Points" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Divider orientation="left" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Add New PS Level</Divider>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="psSubject" label="Subject">
                                <Input placeholder="e.g. Python" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="psLevel" label="Level">
                                <InputNumber style={{ width: '100%' }} min={1} placeholder="1" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="reason" label="Update Reason / Activity Name">
                        <Input placeholder="e.g. Hackathon Winner" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block size="large">
                        Save Changes
                    </Button>
                </Form>
            </Modal>

            <Modal
                title="Student Leaderboard (Top 20)"
                open={leaderboardVisible}
                onCancel={() => setLeaderboardVisible(false)}
                footer={null}
                width={700}
                centered
            >
                <List
                    itemLayout="horizontal"
                    dataSource={leaderboardData}
                    renderItem={(item, index) => (
                        <List.Item>
                            <List.Item.Meta
                                avatar={
                                    <Avatar
                                        style={{ backgroundColor: index < 3 ? '#ffec3d' : '#f0f0f0', color: index < 3 ? '#000' : '#8c8c8c' }}
                                    >
                                        {index + 1}
                                    </Avatar>
                                }
                                title={item.user?.name || 'Unknown'}
                                description={`${item.user?.department || 'N/A'} • Year ${item.year}`}
                            />
                            <div style={{ textAlign: 'right' }}>
                                <Text strong style={{ color: 'var(--primary-color)', fontSize: '16px' }}>{item.rewardPoints}</Text>
                                <div style={{ fontSize: '12px', color: '#999' }}>Points</div>
                            </div>
                        </List.Item>
                    )}
                />
            </Modal>
        </div>
    );
};

export default FacultyPoints;
