import React, { useState, useEffect, useContext } from 'react';
import { Layout, Card, Descriptions, List, Avatar, Tag, Row, Col } from 'antd';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { TrophyOutlined } from '@ant-design/icons';

const { Content } = Layout;

const ProfilePage = () => {
    const { user } = useContext(AuthContext);
    const [profile, setProfile] = useState(null);
    const [leaderboard, setLeaderboard] = useState([]);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/profile/me', {
                    headers: { Authorization: `Bearer ${user.token}` }
                });
                setProfile(data);
            } catch (error) {
                console.error(error);
            }
        };

        const fetchLeaderboard = async () => {
            try {
                const { data } = await axios.get('http://localhost:5000/api/profile/leaderboard');
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

    return (
        <Content style={{ padding: '20px' }}>
            <Row gutter={24}>
                <Col span={14}>
                    <Card title="My Academic Profile">
                        <Descriptions bordered column={1}>
                            <Descriptions.Item label="Name">{profile?.user?.name}</Descriptions.Item>
                            <Descriptions.Item label="Department">{profile?.user?.department}</Descriptions.Item>
                            <Descriptions.Item label="Roll Number">{profile?.rollNumber}</Descriptions.Item>
                            <Descriptions.Item label="Reward Points">{profile?.rewardPoints} </Descriptions.Item>
                            <Descriptions.Item label="Activity Points">{profile?.activityPoints} </Descriptions.Item>
                        </Descriptions>
                        <h3 style={{ marginTop: '20px' }}>PS Levels Completed</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {profile?.psLevels?.slice().reverse().map((level, idx) => (
                                <Tag color="blue" key={idx} style={{ padding: '8px', fontSize: '14px' }}>
                                    <strong>{level.subject}</strong>: Level {level.level}
                                </Tag>
                            )) || <p>No levels completed yet.</p>}
                        </div>
                    </Card>
                </Col>
                <Col span={10}>
                    <Card title={<><TrophyOutlined style={{ color: 'gold' }} /> Leaderboard (Top 20 of Year)</>}>
                        <List
                            itemLayout="horizontal"
                            dataSource={leaderboard}
                            renderItem={(item, index) => (
                                <List.Item>
                                    <List.Item.Meta
                                        avatar={<Avatar style={{ backgroundColor: index < 3 ? '#f56a00' : undefined }}>{index + 1}</Avatar>}
                                        title={item.user?.name}
                                        description={`${item.rewardPoints} Points - ${item.user?.department}`}
                                    />
                                </List.Item>
                            )}
                        />
                    </Card>
                </Col>
            </Row>
        </Content>
    );
};

export default ProfilePage;
