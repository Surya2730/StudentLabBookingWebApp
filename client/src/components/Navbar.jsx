import React, { useContext } from 'react';
import { Layout, Menu, Button, Typography } from 'antd';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';

const { Header } = Layout;
const { Title } = Typography;

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    return (
        <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 20px', background: '#001529' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Title level={4} style={{ color: 'white', margin: 0, marginRight: 20 }}>
                    Lab Booking
                </Title>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <span style={{ color: 'white' }}>
                    <UserOutlined style={{ marginRight: 5 }} />
                    {user.name} ({user.role})
                </span>
                <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                    Logout
                </Button>
            </div>
        </Header>
    );
};

export default Navbar;
