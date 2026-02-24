import React, { useContext } from 'react';
import { Layout, Button, Avatar, Dropdown, Menu } from 'antd';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogoutOutlined, UserOutlined, SettingOutlined, HomeOutlined } from '@ant-design/icons';

const { Header } = Layout;

const Navbar = () => {
    const { user, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    if (!user) return null;

    const menu = (
        <Menu>
            <Menu.Item key="logout" danger icon={<LogoutOutlined />} onClick={handleLogout}>
                Logout
            </Menu.Item>
        </Menu>
    );

    return (
        <Header style={{
            background: '#fff',
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--border-color)',
            height: '70px'
        }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <Button
                    type="link"
                    icon={<HomeOutlined />}
                    onClick={() => {
                        if (user.role === 'faculty' || user.role === 'admin') {
                            navigate('/faculty/home');
                        } else {
                            navigate('/student-dashboard');
                        }
                    }}
                    style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}
                >
                    Home
                </Button>
            </div>

            <Dropdown overlay={menu} trigger={['click']}>
                <div style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', lineHeight: '1.2' }}>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{user.name}</span>
                        <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{user.role}</span>
                    </div>
                    <Avatar
                        style={{ backgroundColor: 'var(--primary-color)', verticalAlign: 'middle' }}
                        size="large"
                        icon={<UserOutlined />}
                    />
                </div>
            </Dropdown>
        </Header>
    );
};

export default Navbar;
