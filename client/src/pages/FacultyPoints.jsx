import React, { useState, useContext } from 'react';
import { Card, Button, Input, List, Avatar, Modal, Form, InputNumber, message, Typography, Breadcrumb, Row, Col, Tag } from 'antd';
import { UserOutlined, TrophyOutlined, HomeOutlined, SearchOutlined } from '@ant-design/icons';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const FacultyPoints = () => {
    const { user } = useContext(AuthContext);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchedStudents, setSearchedStudents] = useState([]);
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [pointsModalVisible, setPointsModalVisible] = useState(false);
    const [pointsForm] = Form.useForm();
    const API_URL = 'http://localhost:5000/api';

    // Safe Check
    if (!user) return <div style={{ padding: 20 }}>Loading...</div>;

    // Initial Fetch
    React.useEffect(() => {
        if (user) handleSearchStudents();
    }, [user]);

    const handleSearchStudents = async (queryOverride) => {
        // Remove trim check to allow empty search (fetch all)
        const q = queryOverride !== undefined ? queryOverride : searchQuery;
        try {
            const { data } = await axios.get(`${API_URL}/profile/search?query=${q}`, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            setSearchedStudents(data);
        } catch (error) {
            message.error('Search failed');
        }
    };

    const handleUpdatePoints = async (values) => {
        try {
            await axios.put(`${API_URL}/profile/update-points`, {
                studentId: selectedStudent._id,
                ...values
            }, {
                headers: { Authorization: `Bearer ${user.token}` }
            });
            message.success('Student Status Updated Successfully');
            setPointsModalVisible(false);
            pointsForm.resetFields();
            // Clear selection or keep it? Let's clear search to refresh flow
            // setSearchedStudents([]); 
        } catch (error) {
            message.error('Failed to update status');
        }
    };

    return (
        <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100%' }}>

            <Title level={2} style={{ marginBottom: '24px' }}>Manage Student Progress</Title>

            <Card style={{ borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
                <Row gutter={16} align="middle">
                    <Col xs={24} md={18}>
                        <Input
                            size="large"
                            placeholder="Search student by Name or Email..."
                            prefix={<SearchOutlined />}
                            value={searchQuery}
                            onChange={(e) => {
                                const val = e.target.value;
                                setSearchQuery(val);
                                handleSearchStudents(val);
                            }}
                        // onPressEnter removed as it's real-time now
                        />
                    </Col>
                    <Col xs={24} md={6}>
                        <Button
                            type="primary"
                            size="large"
                            onClick={handleSearchStudents}
                            block
                            style={{ background: '#001529', borderColor: '#001529' }}
                        >
                            Search
                        </Button>
                    </Col>
                </Row>

                <List
                    style={{ marginTop: '20px' }}
                    itemLayout="horizontal"
                    dataSource={searchedStudents}
                    renderItem={item => (
                        <List.Item
                            actions={[
                                <Button
                                    type="primary"
                                    ghost
                                    icon={<TrophyOutlined />}
                                    onClick={() => { setSelectedStudent(item); setPointsModalVisible(true); }}
                                >
                                    Manage
                                </Button>
                            ]}
                        >
                            <List.Item.Meta
                                avatar={<Avatar size="large" icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />}
                                title={<span style={{ fontWeight: 'bold', fontSize: '16px' }}>{item.name}</span>}
                                description={
                                    <div style={{ marginTop: '8px' }}>
                                        <div style={{ marginBottom: '4px' }}>{item.email} • <Tag color="blue">{item.department}</Tag></div>
                                        <div>
                                            <Tag color="gold">Reward Pts: {item.rewardPoints}</Tag>
                                            <Tag color="cyan">Activity Pts: {item.activityPoints}</Tag>
                                            {item.psLevels && item.psLevels.length > 0 && (
                                                <Tag color="purple">Latest: {item.psLevels[item.psLevels.length - 1].subject} Lvl {item.psLevels[item.psLevels.length - 1].level}</Tag>
                                            )}
                                        </div>
                                    </div>
                                }
                            />
                        </List.Item>
                    )}
                />
            </Card>

            <Modal title={<span><TrophyOutlined style={{ color: '#faad14' }} /> Manage Student Status</span>} open={pointsModalVisible} onCancel={() => setPointsModalVisible(false)} footer={null}>
                <Form form={pointsForm} layout="vertical" onFinish={handleUpdatePoints}>
                    <div style={{ marginBottom: '20px', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
                        <p style={{ fontWeight: 'bold' }}>Progress History:</p>
                        {selectedStudent?.psLevels?.length > 0 ? (
                            <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                                {selectedStudent.psLevels.slice().reverse().map((l, i) => (
                                    <Tag key={i} color="purple" style={{ marginBottom: '4px' }}>{l.subject} - Lvl {l.level}</Tag>
                                ))}
                            </div>
                        ) : <p style={{ color: '#999' }}>No levels recorded yet.</p>}
                    </div>

                    <p>Updating profile for: <strong>{selectedStudent?.name}</strong></p>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="rewardPoints" label="Reward Points">
                                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="activityPoints" label="Activity Points">
                                <InputNumber style={{ width: '100%' }} min={0} placeholder="0" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={12}>
                            <Form.Item name="psSubject" label="PS Subject (e.g. Kotlin)">
                                <Input placeholder="Subject Name" />
                            </Form.Item>
                        </Col>
                        <Col span={12}>
                            <Form.Item name="psLevel" label="Level Completed">
                                <InputNumber style={{ width: '100%' }} min={1} placeholder="1" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Form.Item name="reason" label="Update Reason / Activity Name">
                        <Input placeholder="e.g. Won Hackathon / Completed Module 5" />
                    </Form.Item>

                    <Button type="primary" htmlType="submit" block style={{ background: '#faad14', borderColor: '#faad14', color: '#fff' }}>
                        Update Student Profile
                    </Button>
                </Form>
            </Modal>
        </div>
    );
};

export default FacultyPoints;
